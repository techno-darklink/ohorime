'use strict';
const Command = require('../../plugin/Command');

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
      usage: 'pause',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: [
        'ADD_REACTIONS',
      ],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - argument
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @return {Message}
   */
  async launch(message, query, {guild, guildPlayer}) {
    const player = new (require('./play'))(this.client);
    await player.initQueue(this.client.music, message.guild.id);
    if (this.client.music[message.guild.id].broadcast) {
      return message.reply(
          language(guild.lg, 'command_loop_repeat_radio'),
      );
    } else if (!this.client.music[message.guild.id].dispatcher) {
      return message.reply(
          language(guild.lg, 'command_loop_noPlaying'),
      );
    };
    switch (query.join('')) {
      case 'off':
        guildPlayer.player_loop = 'off';
        await this.client.updateGuild(message.guild, {
          player_loop: guildPlayer.player_loop,
        });
        message.react('➡️');
        break;
      case 'on':
        guildPlayer.player_loop = 'on';
        await this.client.updateGuild(message.guild, {
          player_loop: guildPlayer.player_loop,
        });
        message.react('🔁');
        break;
      case 'once':
        guildPlayer.player_loop = 'once';
        await this.client.updateGuild(message.guild, {
          player_loop: guildPlayer.player_loop,
        });
        message.react('🔂');
        break;
      default:
        if (guild.player.loop === 'off') {
          guildPlayer.player_loop = 'on';
          await this.client.updateGuild(message.guild, {
            player_loop: guildPlayer.player_loop,
          });
          message.react('🔁');
        } else if (guild.player.loop === 'on') {
          guildPlayer.player_loop = 'once';
          await this.client.updateGuild(message.guild, {
            player_loop: guildPlayer.player_loop,
          });
          message.react('🔂');
        } else if (guild.player.loop === 'once') {
          guildPlayer.player_loop = 'off';
          await this.client.updateGuild(message.guild, {
            player_loop: guildPlayer.player_loop,
          });
          message.react('➡️');
        };
        break;
    }
  };
};
