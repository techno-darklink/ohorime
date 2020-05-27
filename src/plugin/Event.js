'use strict';
/**
 * Template for event
 */
class Event {
  /**
    * @param {Client} client - Client
    */
  constructor(client, {
    name = null,
    enable = true,
    filename = __filename,
  }) {
    this.client = client;
    this.help = {name};
    this.conf = {enable, filename};
  };
};

module.exports = Event;
