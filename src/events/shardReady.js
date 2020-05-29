'use strict';
const event = require('./../plugin/Event');

/**
   * Event ShardReady
   */
module.exports = class ShardReady extends event {
  /**
     * @param {Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'shardReady',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
      * Launch script
      * @param {Number} id
      * @param {?Set<string>} unavailableGuilds
      */
  async launch(id, unavailableGuilds) {
    if (process.env.NODE_ENV === 'production') {
      this.client.statusHook.send({
        embeds: [{
          description:
              // eslint-disable-next-line max-len
              `Shard ${id+1}/${this.client.shard.count} ready`,
          color: '#00FF7C',
        }],
      });
    };
  };
};
