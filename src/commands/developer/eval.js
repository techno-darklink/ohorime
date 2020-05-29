/* eslint-disable */
'use strict';
const Command = require('../../plugin/Command');
const lib = require('./../../database/lib');

/**
 * Clean a code
 * @function
 * @param {string} text
 * @return {string}
 */
function clean(text) {
  if (typeof text === 'string') {
    return text.replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203));
  };
  return text;
};

/**
 * Command class
 */
module.exports = class Eval extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'eval',
      category: 'developer',
      description: 'command_eval_description',
      usage: 'eval (code)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      bypass: true,
      aliases: [],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - argument
   */
  async launch(message, query, d) {
    const code = query.join(' ');
    if (!code) return false;
    try {
      const evaled = eval(code);
      const cleanCode = await clean(evaled);
      message.channel.send(cleanCode, {code: 'js'})
        .catch(e => message.channel.send(e, {code: 'js'}));
    } catch (error) {
      message.channel.send(error, {code: 'js'});
    };
  };
};
