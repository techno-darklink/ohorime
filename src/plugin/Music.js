'use strict';
const credentials = require('./../../configuration');
const axios = require('axios');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

/**
 * @typedef Player
 * @property {Array<Music>} queue - List of music
 * @property {number} index - Index of player
 * @property {Boolean} isPlaying - If player is work
 * @property {number} [volume=0.50] - Default volume
 * @property {string} [type=null] - Player type
 * @property {Discord.StreamDispatcher} [dispatcher] - Player dispatcher
 * @property {Discord.VoiceConnection} [connection] - Player connection
 * @property {string} [loop='off'] - Player loop
 * @property {Boolean} [muteIndicator=false] - Mute indication
 * @property {Object} backup - Player backup
 * @property {number} [backup.index] - Last index saved
 * @property {number} [backup.seek] - Last seek saved
 */

/**
 * @typedef Music
 * @property {number} songID - Song ID
 * @property {string} guildID - Guild ID
 * @property {string} title - Song title
 * @property {string} thumbnail - Thumbnail url
 * @property {numer} time - Song time
 * @property {string} service - Service
 * @property {Discord.GuildMember} member - Guild member
 */

/**
 * init the player
 * @function
 * @param {Discord.Client} client
 * @param {string} guildID
 * @return {Player}
 */
module.exports.initPlayer = function(client, guildID) {
  if (!client.music[guildID]) {
    client.music[guildID] = {
      queue: [],
      index: 0,
      isPlaying: false,
      volume: 0.50,
      type: null,
      dispatcher: false,
      connection: false,
      loop: 'off',
      muteIndicator: false,
      backup: {
        index: null,
        seek: null,
      },
    };
  };
  return client.music[guildID];
};

/**
 * Save data in backup
 * @function
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 */
module.exports.heathBeat = function(client, message) {
  const player = this.initPlayer(client, message.guild.id);
  player.backup.index = player.index;
    player.dispatcher ?
      player.backup.seek = player.dispatcher.streamTime : null;
};

/**
 * check if the user has the permissions necessery
 * @function
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @return {Boolean}
 */
module.exports.hasPermission = function(client, message) {
  const player = this.initPlayer(client, message.guild.id);
  if (message.member.hasPermission(['ADMINISTRATOR'],
      {checkAdmin: true, checkOwner: true})) {
    return true;
  } else {
    if (message.member.roles.cache.find((role) => role.name === 'DJ')) {
      return true;
    } else {
      if (!player.dispatcher) {
        return true;
      } else {
        if (message.guild.me.voice.channel.members.size < 2) {
          return true;
        } else {
          return false;
        };
      };
    };
  };
};

/**
 * Get songs
 * @param {String} query
 * @return {Promise<Object>}
 */
module.exports.getSongs = async function(query) {
  return await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&key=${credentials.YOUTUBE_KEY}&q=${encodeURI(query)}`).then((response) => response.data).catch((error) => error);
};

/**
 * @param {number} seconds
 * @return {string}
 */
module.exports.parseSeconde = function(seconds) {
  const format = (val) => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;

  return [hours, minutes, seconds % 60].map(format).join(':');
};

/**
 * Play a song
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {number} [seek=0]
 * @return {Promise<Discord.Message>}
 */
module.exports.play = async function(client, message, seek = 0) {
  const player = this.initPlayer(client, message.guild.id);
  if (!player.queue || player.queue.length < 1) {
    return message.channel.send(`The playlist is empty`);
  };
  if (!player.queue[player.index]) {
    player.index = player.queue.length;
    if (!player.queue[player.index]) {
      player.index = 0;
      if (!player.queue[player.index]) {
        return message.channel.send(`The playlist is empty`);
      };
    };
  };
  const msgDl = await message.channel.send('Music downloading 📥');
  player.dispatcher = player.connection.play(
      await ytdl(`https://www.youtube.com/watch?v=${player.queue[player.index].songID}`, {
        filter: 'audioonly',
        quality: 'highestaudio',
      }), {
        volume: player.volume,
        highWaterMark: 100,
        fec: true,
        plp: 30,
        bitrate: 64,
        seek,
      },
  );
  player.connection.voice.setSelfDeaf(true);
  player.connection.voice.setSelfMute(false);
  player.broadcast = false;
  if (!player.muteIndicator) {
    const playNowEmbed = new Discord.MessageEmbed()
        .setTitle(`Now playing`)
        .setDescription(player.queue[player.index].title)
        .setThumbnail(player.queue[player.index].thumbnail);
    message.channel.send({embed: playNowEmbed});
  } else {
    message.react('👌');
  };
  let heatBeat;
  player.dispatcher.on('finish', async () => {
    clearInterval(heatBeat);
    if (player.dispatcher) player.dispatcher.destroy();
    player.dispatcher = null;
    if (player.loop === 'off' && player.queue.length !== 0) {
      player.queue.shift();
      if (player.queue.length === 0) {
        return this.play(client, message);
      };
      player.index = 0;
      this.play(client, message);
    } else if (player.loop === 'on') {
      if (player.index === player.queue.length - 1) {
        player.index = 0;
      } else {
        player.index++;
      };
      this.play(client, message);
    } else if (player.loop === 'once') {
      this.play(client, message);
      player.index = player.index;
    };
  });
  let i = true;
  player.dispatcher.on('speaking', (s) => {
    heatBeat = this.heathBeat(client, message);
    if (s === 1 && i) {
      msgDl.delete({timeout: 100});
      i = false;
    };
    player.isPlaying = s;
  });
  player.dispatcher.on('error', async (err) => {
    clearInterval(heatBeat);
    console.error(err);
    message.channel.send(err, {code: 'js'});
    player.index = player.backup.index;
    return this.play(client, message, player.backup.seek/100);
  });
};

/**
 * Call request
 * @param {Discord.Message} message
 * @param {Discord.Discord.MessageEmbed} embed
 * @param {Object} options
 * @param {string} options.required
 * @param {string} options.complete
 * @param {string} options.content
 * @return {Promise<Boolean>}
 */
module.exports.callRequest = async function(message, embed, options) {
  return new Promise(async (resolve) => {
    const m = await message.channel.send({embed});
    const members = message.member.voice.
        channel.members.filter(((m) => !m.user.bot));
    if (members.size > 1) {
      m.react('👍');
      const mustVote = Math.floor(members.size/2+1);
      embed.setDescription(
          options.required.replace(/{{mustVote}}/g, mustVote ));
      m.edit({embed});

      const filter = (reaction, user) => {
        const member = message.guild.members.cache.get(user.id);
        const voiceChannel = member.voice.channel;
        if (voiceChannel) {
          if (voiceChannel.id === message.member.voice.channelID) {
            return true;
          } else {
            return false;
          };
        };
      };

      const collector = await m.createReactionCollector(filter, {
        time: 25000,
      });

      collector.on('collect', (reaction, user) => {
        const haveVoted = reaction.count-1;
        if (haveVoted >= mustVote) {
          embed.setDescription(options.complete);
          m.edit({embed});
          collector.stop(true);
          resolve(true);
        } else {
          embed.setDescription(
              options.content
                  .replace(/{{haveVoted}}/g, haveVoted)
                  .replace(/{{mustVote}}/g, mustVote));
          m.edit({embed});
        };
      });

      collector.on('end', (collected, isDone) => {
        if (!isDone) {
          message.channel.send('Vote timeout ❌');
          return resolve(false);
        };
      });
    } else {
      resolve(true);
    };
  });
};
