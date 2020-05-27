'use strict';
const event = require('./../plugin/Event');

/**
 * Event GuildCreate
 */
module.exports = class GuildCreate extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'GuildCreate',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
    * Launch script
    * @param {Guild} guild
    * @return {Promise<Message>} message
    */
  async launch(guild) {
    if (!guild) return;
    /**
     * Save guild data
     */
    await this.client.createGuild({
      name: guild.name,
      id: guild.id,
      prefix: this.client.config.prefix,
      color: this.client.config.color,
    });
    /**
     * Send event
     */
    this.client.coreExchange.emit('guildCount',
        await this.client.shard.fetchClientValues('guilds.cache.size')
            .then((results) =>
              results.reduce((prev, guildCount) => prev + guildCount, 0),
            ));
    /**
     * Check bot permissions
     */
    if (!guild.me.hasPermission(['SEND_MESSAGES'], {
      checkAdmin: true,
      checkOwner: true,
    })) {
      return guild.owner.send(language('en', 'client_missing_permissions')
          .replace('{{map}}', `\`SEND_MESSAGES\``)).catch(() => {});
    };
  };
};
