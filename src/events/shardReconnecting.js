'use strict';
const event = require('./../plugin/Event');

/**
   * Event ShardReconnecting
   */
module.exports = class ShardReconnecting extends event {
  /**
     * @param {Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'shardReconnecting',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
      * Launch script
      * @param {number} shardID
      */
  async launch(shardID) {
    if (process.env.NODE_ENV === 'production') {
      this.client.statusHook.send({
        embeds: [{
          description:
              // eslint-disable-next-line max-len
              `Shard ${shardID+1}/${this.client.shard.count} is reconnecting`,
          color: '#FFB816',
        }],
      });
    };
    this.client.logger.warn(event);
  };
};
