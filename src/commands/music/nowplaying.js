'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');
const moment = require('moment');

/**
 * Command class
 */
module.exports = class NowPlaying extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      category: 'music',
      description: 'command_nowplaying_description',
      usage: 'nowplaying',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: ['np'],
      mePerm: [],
      userPerm: [],
    });
    this.client = client;
  };
  /**
     * @param {Discord.Message} message - message
     * @return {Promise<Discord.Message>}
     */
  async launch(message) {
    const player = corePlayer.initPlayer(this.client, message.guild.id);
    if (!player.dispatcher) return message.channel.send(`I don't play a music`);
    const duration = moment.duration({ms: player.queue[player.index].time});
    const progress = moment.duration({ms: player.dispatcher.streamTime});
    const progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬',
      '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
    const calcul = Math.round(progressBar.length *
        (player.dispatcher.streamTime/ (player.queue[player.index].time)));
    progressBar[calcul] = '🔘';
    const npEmbed = new Discord.MessageEmbed()
        .setTitle('Now playing')
        .setDescription(`[${player.queue[player.index].title}](https://www.youtube.com/watch?v=${player.queue[player.index].songID})`)
        .setThumbnail(player.queue[player.index].thumbnail)
        .addField('Duration', '[`' + progress.minutes() + ':' +
          progress.seconds() + '`] ' + progressBar.join('') + ' [`' +
          duration.minutes() + ':' + duration.seconds() + '`]');
    message.channel.send({embed: npEmbed});
  };
};
