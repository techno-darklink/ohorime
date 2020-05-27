'use strict';
const event = require('./../plugin/Event');

/**
 * Event GuildDelete
 */
module.exports = class GuildDelete extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'guildDelete',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
    * Launch script
    * @param {Guild} guild
    */
  async launch(guild) {
    if (!guild) return;
    /**
     * Send event
     */
    this.client.coreExchange.emit('guildCount',
        await this.client.shard.fetchClientValues('guilds.cache.size')
            .then((results) =>
              results.reduce((prev, guildCount) => prev + guildCount, 0),
            ));
  };
};
