'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class SkipTo extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'skipto',
      category: 'music',
      description: 'command_skipto_description',
      usage: 'skipto',
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
      return message.channel.send(`You must enter a number value !`);
    };
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for skip this music`,
            complete: `Vote completed, you skip this music`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        if (query.join('') > player.queue.length - 1) return message.react('💢');
        switch (player.loop) {
          case 'off':
            player.queue = player.queue.slice(query.join('') - 1);
            player.index = 0;
            corePlayer.play(this.client, message);
            break;
          default:
            await player.dispatcher.destroy();
            player.index = query.join('') - 1;
            corePlayer.play(this.client, message);
            break;
        };
      } else {
        return message.channel.send(`You don't skip music`);
      };
    } else {
      if (query.join('') > player.queue.length - 1) return message.react('💢');
      switch (player.loop) {
        case 'off':
          player.queue = player.queue.slice(query.join('') - 1);
          player.index = 0;
          corePlayer.play(this.client, message);
          break;
        default:
          await player.dispatcher.destroy();
          player.index = query.join('') - 1;
          corePlayer.play(this.client, message);
          break;
      };
    };
  };
};
