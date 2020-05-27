'use strict';
const event = require('./../plugin/Event');

/**
 * Event GuildMemberRemove
 */
module.exports = class GuildMemberRemove extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'guildMemberRemove',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
    * Launch script
    * @param {GuildMember} member
    */
  async launch(member) {
    if (!member) return;
    /**
     * Send event
     */
    this.client.coreExchange.emit('memberCount',
        // eslint-disable-next-line max-len
        await this.client.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)')
            .then((results) =>
              results.reduce((prev, memberCount) => prev + memberCount, 0),
            ));
  };
};
