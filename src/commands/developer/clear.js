'use strict';
const command = require('./../../plugin/Command');

/**
 * Commande Clear
 */
module.exports = class Clear extends command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'clear',
      category: 'developer',
      description: 'command_clear_description',
      usage: 'clear (code)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      bypass: true,
      aliases: [],
    });
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - argument
   */
  async launch(message, query, {user, guild}) {
    const msg = await message.channel.send('Process loading...');
    if (query.join('')) {
      if (!this.client.commands.has(query.join('')) &&
      !this.client.aliases.has(query.join(''))) {
        msg.edit('Commande not found !');
      };
      const cmd = this.client.commands.get(query.join('')) ||
        this.client.commands.get(this.client.aliases.get(query.join('')));
      delete require.cache[require.resolve(cmd.conf.filename)];
      this.client.loadCommand(cmd.conf.filename);
      msg.edit(`All task is completed (command ${cmd.help.name}) ✅ :)`);
    } else {
      for (let cmd of this.client.commands) {
        cmd = cmd[1];
        if (!cmd.help) continue;
        if (cmd.help.name === 'clear') {
          continue;
        };
        delete require.cache[require.resolve(cmd.conf.filename)];
        this.client.loadCommand(cmd.conf.filename);
      };
      const e = this.client.commands.map((v) => v).length;
      msg.edit(`All task is completed (${e} commands) ✅ :)`);
    };
  };
};
