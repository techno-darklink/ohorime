'use strict';
const event = require('./../plugin/Event');

/**
   * Event ShardError
   */
module.exports = class ShardError extends event {
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
      * @param {Error} error
      * @param {number} shardID
      */
  async launch(error, shardID) {
    if (process.env.NODE_ENV === 'production') {
      this.client.statusHook.send({
        embeds: [{
          description:
              // eslint-disable-next-line max-len
              `Shard ${shardID+1}/${this.client.shard.count} has an error`,
          color: '#FF0000',
        }],
      });
    };
    this.client.logger.error(error);
  };
};
