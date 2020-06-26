'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Leave extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'leave',
      category: 'music',
      description: 'command_leave_description',
      usage: 'leave',
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
     * @return {Promise<Discord.Message>}
     */
  async launch(message) {
    if (!message.member.voice.channel) return message.reply('💢');
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for seek the stream`,
            complete: `Vote completed, you seek the stream`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        return message.member.voice.channel.leave();
      } else {
        return message.channel.send(`You don't leave bot from channel`);
      };
    } else {
      return message.member.voice.channel.leave();
    };
  };
};
