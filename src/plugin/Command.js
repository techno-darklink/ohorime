'use strict';
/**
 * Template for command
 */
class Command {
  /**
    * @param {Client} client - Client
    */
  constructor(client, {
    name = null,
    description = null,
    category = 'user',
    usage = null,
    nsfw = false,
    enable = true,
    guildOnly = true,
    userPerm = [],
    mePerm = [],
    aliases = [],
    filename = __filename,
  }) {
    this.client = client;
    this.help = {name, description, category, usage};
    this.conf = {enable, guildOnly, aliases, nsfw, userPerm, mePerm, filename};
  };
};

module.exports = Command;
