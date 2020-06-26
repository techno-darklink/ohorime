'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Pause extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'pause',
      category: 'music',
      description: 'command_pause_description',
      usage: 'pause',
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
    const player = corePlayer.initPlayer(this.client, message.guild.id);
    if (!player.dispatcher) return message.channel.send(`I don't play a music`);
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for set pause the stream`,
            complete: `Vote completed, you set pause the stream`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        player.dispatcher.pause();
      } else {
        return message.channel.send(`You don't set stream to pause`);
      };
    } else {
      player.dispatcher.pause();
    };
  };
};
