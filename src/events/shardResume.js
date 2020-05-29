'use strict';
const event = require('./../plugin/Event');

/**
   * Event ShardResume
   */
module.exports = class ShardResume extends event {
  /**
     * @param {Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'shardResume',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
      * Launch script
      * @param {number} id
      * @param {number} replayedEvents
      */
  async launch(id, replayedEvents) {
    if (process.env.NODE_ENV === 'production') {
      this.client.statusHook.send({
        embeds: [{
          description:
              // eslint-disable-next-line max-len
              `Shard ${id+1}/${this.client.shard.count} has resume`,
          color: '#1F7100',
        }],
      });
    };
  };
};
