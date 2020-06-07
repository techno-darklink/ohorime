'use strict';
const Command = require('../../plugin/Command');

/**
 * Invite command
 */
module.exports = class Invite extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'util',
      description: 'command_invite_description',
      usage: 'invite',
      nsfw: false,
      enable: true,
      guildOnly: false,
      aliases: [],
      mePerm: [],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @return {Promise<Message>}
   */
  async launch(message) {
    /**
     * Send message
     */
    return message.channel.send(`https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=-1&scope=bot`);
  };
};
