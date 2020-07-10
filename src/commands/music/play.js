'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');
const htmlEntitiesDecoder = require('html-entities-decoder');

/**
 * Command class
 */
module.exports = class Play extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'play',
      category: 'music',
      description: 'command_play_description',
      usage: 'play [youtube url | song title]',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
      userPerm: [],
    });
    this.client = client;
  };
  /**
     * @param {Discord.Message} message - message
     * @param {Array<string>} query - arguments
     * @return {Promise<Discord.Message>}
     */
  async launch(message, query) {
    if (!message.member.voice.channel) {
      return message.channel.send(
          `You must connect on the voice channel before !`);
    };
    if (!corePlayer.hasPermission(this.client, message) &&
    (message.guild.me.voice.channel && message.guild.me.voice.channelID ===
      message.member.voice.channelID)) {
      return message.channel.send(`Do you not have necessery permission`);
    };

    const player = corePlayer.initPlayer(this.client, message.guild.id);
    player.connection = await message.member.voice.channel.join();

    if (!query.join('') && player.queue.length >= 1) {
      return corePlayer.play(this.client, message);
    };

    if (/^https?:\/\/(youtu\.be\/|(www\.)?youtube.com\/(embed|v)\/)/i.test(
        query.join(''))) {
      const serialize = query.join('').split('?')[1].split(/&/g);
      const i = serialize.findIndex((v) => v.startsWith('v'));
      const info = await corePlayer.getInfoVideo([serialize[i].split('=')[1]]);
      let time = 0;
      if (info.items[0].contentDetails.duration.startsWith('PT')) {
        let parse = info.items[0].contentDetails.duration;
        parse = parse.slice(2);
        parse = parse.split('M');
        time += parseInt(parse.shift())*60000;
        time += parseInt(parse.join('').split('S')[0])*1000;
      };
      const song = {
        songID: serialize[i].split('=')[1],
        guildID: message.guild.id,
        title: info.items[0].snippet.title,
        thumbnail: info.items[0].snippet.thumbnails.high.url,
        time,
        isLive: info.items[0].snippet.liveBroadcastContent ===
          'live' ? true : false,
        service: 'YouTube',
        member: message.member,
      };
      player.queue.push(song);
      player.type = 'player';
      let allTime = 0;
      player.queue.map((v) => allTime = allTime + v.time/1000);
      const addQueueEmbed = new Discord.MessageEmbed()
          .setTitle(`Add music in playlist`)
          .setDescription(song.title)
          .addFields(
              {name: 'Song time',
                value: `${corePlayer.parseSeconde(song.time/1000)}`,
                inline: true},
              {name: 'Playlist time',
                value: `${corePlayer.parseSeconde(allTime)}`, inline: true},
          )
          .setThumbnail(song.thumbnail);
      message.channel.send({embed: addQueueEmbed});
      if (player.queue.length > 1) {
        if (!player.dispatcher) {
          corePlayer.play(this.client, message);
        };
      } else {
        if (player.queue.length <= 1) {
          player.index = 0;
        };
        corePlayer.play(this.client, message);
      };
    } else {
      const youtube = await corePlayer.getSongs(query.join(' '));
      if (youtube.error) {
        return message.channel.send(youtube.error.message, {code: 'js'});
      };
      if (youtube.isAxiosError) {
        return message.channel.send(`ERROR: code http ${youtube.status}`);
      };

      // eslint-disable-next-line guard-for-in
      for (const key in youtube.items) {
        youtube.items[key].snippet.title =
          htmlEntitiesDecoder(youtube.items[key].snippet.title);
      };

      const listEmbed = new Discord.MessageEmbed()
          .setTitle(`here is music list`)
          .setDescription(youtube.items.map((v, i) =>
            `[${i+1}] ${v.snippet.title}`).join('\n'))
          .setTimestamp(Date.now())
          .setFooter(`Entre \`cancel\` for exit selection`);
      message.channel.send({embed: listEmbed}).then((msg) => {
        const filter = (msg) => msg.author.id === message.author.id;
        const collector = new Discord.MessageCollector(message.channel,
            filter, {
              time: 20000,
            });
        collector.on('collect', async (msgCollected) => {
          const choice = msgCollected.content.trim().split()[0];
          if (choice.toLowerCase() === 'cancel') {
            return collector.stop('STOPPED');
          };
          if (!choice || isNaN(choice)) {
            return message.channel.send(`Your choice is invalid`);
          };
          if (choice > youtube.items.length || choice <= 0) {
            return message.reply(`Your choice is not finding in the selection`);
          };
          const items = youtube.items[choice - 1];
          collector.stop('PLAY');
          msg.delete();
          msgCollected.delete();
          if (items.id.kind === 'youtube#channel') {
            return message.channel.send(`I can't play a video with a channel`);
          };
          const info = await corePlayer.getInfoVideo([items.id.videoId]);
          let time = 0;
          if (info.items[0].contentDetails.duration.startsWith('PT')) {
            let parse = info.items[0].contentDetails.duration;
            parse = parse.slice(2);
            parse = parse.split('M');
            time += parseInt(parse.shift())*60000;
            time += parseInt(parse.join('').split('S')[0])*1000;
          };
          const song = {
            songID: info.items[0].id,
            guildID: message.guild.id,
            title: info.items[0].snippet.title,
            thumbnail: info.items[0].snippet.thumbnails.high.url,
            time,
            isLive: info.items[0].snippet.liveBroadcastContent ===
              'live' ? true : false,
            service: 'YouTube',
            member: message.member,
          };
          player.queue.push(song);
          player.type = 'player';
          let allTime = 0;
          player.queue.map((v) => allTime = allTime + v.time/1000);
          const addQueueEmbed = new Discord.MessageEmbed()
              .setTitle(`Add music in playlist`)
              .setDescription(song.title)
              .addFields(
                  {name: 'Song time',
                    value: `${corePlayer.parseSeconde(song.time/1000)}`,
                    inline: true},
                  {name: 'Playlist time',
                    value: `${corePlayer.parseSeconde(allTime)}`, inline: true},
              )
              .setThumbnail(song.thumbnail);
          message.channel.send({embed: addQueueEmbed});
          if (player.queue.length > 1) {
            if (!player.dispatcher) {
              corePlayer.play(this.client, message);
            };
          } else {
            if (player.queue.length <= 1) {
              player.index = 0;
            };
            corePlayer.play(this.client, message);
          };
        });
        collector.on('end', (collected, reason) => {
          if (reason === 'STOPPED') {
            return message.reply('You have cancelled the selection');
          } else if (reason === 'PLAY') {
            return false;
          } else {
            return message.reply('Do you not have select a song');
          };
        });
      });
    }
  };
};
