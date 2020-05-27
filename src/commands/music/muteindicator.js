'use strict';
const Command = require('../../plugin/Command');

/**
 * Command class
 */
module.exports = class muteindicator extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'muteindicator',
      category: 'music',
      description: 'command_muteindicator_description',
      usage: 'queue',
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
    if (guildPlayer.player_muteIndicator) {
      guildPlayer.player_muteindicator = false;
      await this.client.updatePlayerGuild(message.guild, {
        player_muteIndicator: guildPlayer.player_muteIndicator,
      });
      return message.react('❌');
    } else {
      guildPlayer.player_muteIndicator = true;
      await this.client.updatePlayerGuild(message.guild, {
        player_muteIndicator: guildPlayer.player_muteIndicator,
      });
      return message.react('⭕');
    };
  };
};
