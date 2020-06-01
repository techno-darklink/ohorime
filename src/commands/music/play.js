/* eslint-disable max-len */
'use strict';
const Command = require('../../plugin/Command');
const language = require('../../i18n');
const ytdl = require('ytdl-core');
const {YOUTUBE_KEY} = require('../../../configuration');
const axios = require('axios');
const {MessageCollector} = require('discord.js');
const htmlEntitiesDecoder = require('html-entities-decoder');

/**
 * Play command
 */
module.exports = class Play extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'play',
      category: 'music',
      description: 'command_play_description',
      usage: 'play [title song | url youtube]',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: ['p'],
      mePerm: [
        'CONNECT',
        'SPEAK',
        'EMBED_LINKS',
        'ADD_REACTIONS',
        'MANAGE_MESSAGES',
      ],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array<String>} query - argument
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @return {Promise<Message>}
   */
  async launch(message, query, {guild, guildPlayer}) {
    this.initQueue(this.client.music, message.guild.id);
    if (!message.guild.me.voice.channel) {
      if (!message.member.voice.channel) {
        return message.channel.send(
            language(guild.lg, 'command_music_userNoJoin'),
        );
      };
      if (this.hasPermission(message)) {
        this.client.music[message.guild.id].connection =
          await message.member.voice.channel.join();
      } else {
        return message.reply(
            language(guild.lg, 'command_music_noPermissions'),
        );
      };
    } else {
      if (!message.member.voice.channel) {
        return message.channel.send(
            language(guild.lg, 'command_music_userNoJoin'),
        );
      };
      if (!this.client.music[message.guild.id].connection) {
        this.client.music[message.guild.id].connection =
          await message.member.voice.channel.join();
      };
    };
    if (!query.join(' ')) return this.play(message, guildPlayer, guild);
    const youtube = await this.getSong(query);
    if (youtube.error) return message.channel.send(youtube.error.message);
    if (youtube.isAxiosError) {
      return message.channel.send(`ERROR: code http ${youtube.status}`);
    };
    // eslint-disable-next-line guard-for-in
    for (const key in youtube.items) {
      youtube.items[key].snippet.title =
        htmlEntitiesDecoder(youtube.items[key].snippet.title);
    };
    const embed = {
      title: language(guild.lg, 'command_music_listMusic'),
      color: guild.color,
      description: `${youtube.items.map((v, i) =>
        `[${i+1}] ${v.snippet.title}`).join('\n')}`,
      timestamp: Date.now(),
      footer: {
        text: language(guild.lg, 'command_music_choiceFooter'),
        icon_url: this.client.user
            .displayAvatarURL({format: 'webp', dynamic: true, size: 2048}),
      },
    };
    message.channel.send({embed}).then((msg) => {
      const filter = (msg) => msg.author.id === message.author.id;
      const collector = new MessageCollector(message.channel, filter, {
        time: 20000,
      });
      collector.on('collect', async (msgCollected) => {
        const choice = msgCollected.content.trim().split()[0];
        if (choice.toLowerCase() === 'cancel') {
          return collector.stop('STOPPED');
        };
        if (!choice || isNaN(choice)) {
          return message.channel.send(
              language(guild.lg, 'command_music_choiceInvalid'),
          );
        };
        if (choice > youtube.items.length || choice <= 0) {
          return message.reply(
              language(guild.lg, 'command_music_choiceNotFound'),
          );
        };
        const song = youtube.items[choice - 1];
        collector.stop('PLAY');
        msg.delete();
        msgCollected.delete();
        const info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${song.id.videoId}`);
        song.time = JSON.parse(JSON.stringify(info)).length_seconds*1000;
        song.request = message.member;
        if (!guildPlayer.player_history) guildPlayer.player_history = [];
        guildPlayer.player_history.push(song);
        this.client.music[message.guild.id].type = 'player';
        guildPlayer = await this.updateQueue(guildPlayer.player_history, message);
        if (guildPlayer.player_history.length > 1) {
          message.channel.send({embed: {
            color: guild.color,
            title: 'Ajout à la playlist',
            description: song.snippet.title,
            thumbnail: {
              url: song.snippet.thumbnails.high.url,
            },
          },
          });
          if (!this.client.music[message.guild.id].dispatcher) {
            this.play(message, guildPlayer, guild);
          }
        } else {
          if (guildPlayer.player_history <= 1) {
            this.client.music[message.guild.id].index = 0;
          };
          this.play(message, guildPlayer, guild);
        };
      });
      collector.on('end', (collected, reason) => {
        if (reason === 'STOPPED') {
          return message.reply(language(guild.lg, 'command_music_choiceStop'));
        } else if (reason === 'PLAY') {
          return false;
        } else {
          return message.reply(language(guild.lg, 'command_music_timeout'));
        };
      });
    });
  };
  /**
   * play song
   * @param {Message} message - message
   * @param {Object} guildPlayer - guild data
   * @param {Object} guild
   * @return {*}
   */
  async play(message, guildPlayer, guild) {
    guildPlayer = await this.client.getPlayerGuild(message.guild);
    if (!guildPlayer.player_history || guildPlayer.player_history.length < 1) {
      return message.channel.send(
          language(guild.lg, 'command_music_notQueue'),
      );
    };
    if (!guildPlayer.player_history[this.client.music[message.guild.id].index]) {
      this.client.music[message.guild.id].index = guildPlayer.player_history.length;
    };
    this.client.music[message.guild.id].dispatcher =
    this.client.music[message.guild.id].connection.play(
        await ytdl(`https://www.youtube.com/watch?v=${guildPlayer.player_history[this.client.music[message.guild.id].index].id.videoId}`, {
          filter: 'audioonly',
          highWaterMark: 20,
          quality: 'highestaudio',
        }, {
          volume: guildPlayer.player_volume/100,
          fec: true,
          bitrate: 96,
          highWaterMark: 20,
          seek: 0,
        }),
    );
    this.client.music[message.guild.id].connection.voice.setSelfDeaf(true);
    this.client.music[message.guild.id].connection.voice.setSelfMute(false);
    this.client.music[message.guild.id].broadcast = false;
    if (!guildPlayer.player_muteIndicator) {
      message.channel.send({
        embed: {
          color: guild.color,
          title: language(guild.lg, 'commande_music_played'),
          description: guildPlayer.player_history[
              this.client.music[message.guild.id].index].snippet.title,
          thumbnail: {
            url: guildPlayer.player_history[
                this.client.music[
                    message.guild.id].index].snippet.thumbnails.default.url,
          },
        },
      });
    } else {
      message.react('👌');
    };
    this.client.music[message.guild.id]
        .dispatcher.on('finish', async () => {
          guildPlayer = await this.client.getPlayerGuild(message.guild);
          this.client.music[message.guild.id].dispatcher = null;
          if (guildPlayer.player_loop === 'off' &&
            guildPlayer.player_history.length !== 0) {
            guildPlayer.player_history.shift();
            guildPlayer = await this.updateQueue(guildPlayer.player_history, message);
            if (guildPlayer.player_history.length === 0) {
              return message.channel.send(
                  language(guild.lg, 'command_music_finish'),
              );
            };
            this.client.music[message.guild.id].index = 0;
            this.play(message, guildPlayer, guild);
          } else if (guildPlayer.player_loop === 'on') {
            if (this.client.music[message.guild.id].index ===
              guildPlayer.player_history.length - 1) {
              this.client.music[message.guild.id].index = 0;
            } else {
              this.client.music[message.guild.id].index++;
            };
            this.play(message, guildPlayer, guild);
          } else if (guildPlayer.player_loop === 'once') {
            this.play(message, guildPlayer, guild);
            this.client.music[message.guild.id].index =
              this.client.music[message.guild.id].index;
          };
        });
    let r;
    this.client.music[message.guild.id].dispatcher.on('speaking', (s) => {
      if (s === r) return;
      r=s;
      this.client.music[message.guild.id].isPlaying = s;
    });
    this.client.music[message.guild.id].dispatcher.on('error',
        async (err) => {
          console.error(err);
          guildPlayer = await this.client.getPlayerGuild(message.guild);
          this.play(message, guildPlayer, guild);
          return message.channel.send(err, {code: 'js'});
        });
  };
  /**
   * Add song in Queue
   * @param {Object} queue - player
   * @param {Message} message - message
   * @return {Promise<Object>}
   */
  async updateQueue(queue, message) {
    await this.client.updatePlayerGuild(message.guild, {
      player_history: queue,
    });
    return await this.client.getPlayerGuild(message.guild);
  };
  /**
   * Get data of song
   * @param {Array<String>} query - query
   * @return {Promise<Object>}
   */
  async getSong(query) {
    return await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&key=${YOUTUBE_KEY}&q=${encodeURI(query.join(' '))}`).then((response) => response.data).catch((error) => error);
  };
  /**
   * Initialise queue
   * @param {Object} queue - Global queue
   * @param {Number} guildID - guild id
   * @return {Object}
   */
  initQueue(queue, guildID) {
    if (!queue[guildID]) {
      return queue[guildID] = {
        connection: null,
        dispatcher: null,
        index: 0,
        broadcast: false,
        type: 'player',
      };
    } else {
      return queue[guildID];
    };
  };
  /**
   * Check if user has permissions to execute music command
   * @param {Message} message
   * @return {boolean}
   */
  hasPermission(message) {
    if (!message.guild.me.voice.channel) return true;
    if (message.member.hasPermission(['ADMINISTRATOR'],
        {checkAdmin: true, checkOwner: true})) return true;
    if (message.member.roles.cache.some((r) => r.name === 'dj')) return true;
    if (message.guild.me.voice.channel.members.size <= 2) return true;
    return false;
  }
};
