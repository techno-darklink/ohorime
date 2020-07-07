'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Volume extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'volume',
      category: 'music',
      description: 'command_volume_description',
      usage: 'volume',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: [],
      userPerm: [],
    });
    this.client = client;
  };
  /**
     * @param {Discord.Message} message - message
     * @param {Array<strin>} query - arguments
     * @return {Promise<Discord.Message>}
     */
  async launch(message, query) {
    if (!message.member.voice.channel) return message.reply('💢');
    const player = corePlayer.initPlayer(this.client, message.guild.id);
    if (!player.dispatcher) return message.channel.send(`I don't play a music`);
    if (!query.join('') || isNaN(query.join(''))) {
      return message.
          channel.send(`Current volume is ${player.dispatcher.volume*100}%`);
    };
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for set volume`,
            complete: `Vote completed, you set volume`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        player.volume = query.join('');
        player.dispatcher.setVolume(query.join('')/100);
      } else {
        return message.channel.send(`You don't skip music`);
      };
    } else {
      player.volume = query.join('');
      player.dispatcher.setVolume(query.join('')/100);
    };
  };
};
