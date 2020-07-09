'use strict';
/**
 * Template for command
 */
class Command {
  /**
    * @param {Client} client - Client
    */
  constructor(client, {
    name = ''.trim().toLowerCase(),
    description = null,
    category = 'user',
    usage = [],
    exemple = [],
    nsfw = false,
    enable = true,
    guildOnly = true,
    userPerm = [],
    mePerm = [],
    aliases = [],
    filename = __filename,
  }) {
    this.client = client;
    this.help = {name, description, category, usage, exemple};
    this.conf = {enable, guildOnly, aliases, nsfw, userPerm, mePerm, filename};
    this.badUsage = {
      color: 'RED',
      fields: [
        {
          name: '🧭 Argument reminder',
          // eslint-disable-next-line max-len
          value: '> () -> obligatory argument(s)\n> [] -> optional argument(s)\n> <> -> option(s)\n> ... -> can use multiple arguments\n> | -> or/and argument(s)',
        },
        {
          name: '🔧 Command usage',
          value: Array.isArray(usage) ? `> ${usage.join('\n > ')}` :
          `> ${usage}`,
        },
        {
          name: '🖊️ Command exemple',
          value: `> ${exemple.join('\n > ')}`,
        },
      ],
    };
  };
};

module.exports = Command;
