'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Loop extends Command {
  /**
     * @param {Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'loop',
      category: 'music',
      description: 'command_loop_description',
      usage: 'loop (on | once | off)',
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
     * @param {Array<string>} query - argument
     * @return {Promise<Discord.Message>}
     */
  async launch(message, query) {
    if (!message.member.voice.channel) return message.reply('💢');
    const player = corePlayer.initPlayer(this.client, message.guild.id);
    if (!player.dispatcher) return message.channel.send(`I don't play a music`);
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for loop stream`,
            complete: `Vote completed, you loop stream`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        switch (query.join('')) {
          case 'off':
            player.loop = 'off';
            message.react('➡️');
            break;
          case 'on':
            player.loop = 'on';
            message.react('🔁');
            break;
          case 'once':
            player.loop = 'once';
            message.react('🔂');
            break;
          default:
            if (player.loop === 'off') {
              player.loop = 'on';
              message.react('🔁');
            } else if (player.loop === 'on') {
              player.loop = 'once';
              message.react('🔂');
            } else if (player.loop === 'once') {
              player.loop = 'off';
              message.react('➡️');
            };
            break;
        };
      } else {
        return message.channel.send(`You don't skip music`);
      };
    } else {
      switch (query.join('')) {
        case 'off':
          player.loop = 'off';
          message.react('➡️');
          break;
        case 'on':
          player.loop = 'on';
          message.react('🔁');
          break;
        case 'once':
          player.loop = 'once';
          message.react('🔂');
          break;
        default:
          if (player.loop === 'off') {
            player.loop = 'on';
            message.react('🔁');
          } else if (player.loop === 'on') {
            player.loop = 'once';
            message.react('🔂');
          } else if (player.loop === 'once') {
            player.loop = 'off';
            message.react('➡️');
          };
          break;
      };
    };
  };
};
