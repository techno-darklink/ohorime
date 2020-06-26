'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Remove extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'remove',
      category: 'music',
      description: 'command_remove_description',
      usage: 'remove [number]',
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
    if (query.join('') > player.queue.length - 1) return message.react('💢');
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for remove ${
              player.queue[query.join('')].title}`,
            complete: `Vote completed, you remove ${
              player.queue[query.join('')].title} from the playlist`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        if (player.index > query.join('')) player.index--;
        player.queue.splice(query.join('', 1));
      } else {
        return message.channel.send(`You don't set stream to resume`);
      };
    } else {
      if (player.index > query.join('')) player.index--;
      player.queue.splice(query.join('', 1));
    };
  };
};
