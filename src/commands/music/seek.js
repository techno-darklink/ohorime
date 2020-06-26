'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Seek extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'seek',
      category: 'music',
      description: 'command_seek_description',
      usage: 'seek [number]',
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
      return message.channel.send(`You must enter a number value in seconds!`);
    };
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for seek the stream`,
            complete: `Vote completed, you seek the stream`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        corePlayer.play(this.client, message, query.join(''));
      } else {
        return message.channel.send(`You don't set stream to resume`);
      };
    } else {
      corePlayer.play(this.client, message, query.join(''));
    };
  };
};
