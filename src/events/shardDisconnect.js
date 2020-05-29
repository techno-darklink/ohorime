'use strict';
const event = require('./../plugin/Event');

/**
   * Event ShardDisconnect
   */
module.exports = class ShardDisconnect extends event {
  /**
     * @param {Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'shardError',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
      * Launch script
      * @param {CloseEvent} event
      * @param {number} shardID
      */
  async launch(event, shardID) {
    if (process.env.NODE_ENV === 'production') {
      this.client.statusHook.send({
        embeds: [{
          description:
              // eslint-disable-next-line max-len
              `Shard ${shardID+1}/${this.client.shard.count} is disconnect`,
          color: '#450000',
        }],
      });
    };
    this.client.logger.warn(event);
  };
};
