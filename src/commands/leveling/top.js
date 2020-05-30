'use strict';
const Command = require('../../plugin/Command');
const language = require('../../i18n');
const {LevelingUser} = require('./../../database/lib');

/**
 * Get algorithme
 * @param {number} messages
 * @param {?number} difficulty
 * @return {object}
 */
function calculatepoint(messages, difficulty = 1.25) {
  const algos = {
    messages,
    difficulty,
  };
  algos.xp = algos.messages/1.25;
  algos.base = 100*algos.difficulty;
  algos.level = Math.ceil(
      (algos.difficulty*algos.xp)/(algos.difficulty*algos.base));
  algos.next = algos.base*algos.level;
  algos.ratio = algos.xp/algos.next;
  return algos;
};

/**
 * Command class
 */
module.exports = class Top extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'top',
      category: 'leveling',
      description: 'command_top_description',
      usage: 'top (global)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      mePerm: ['EMBED_LINKS'],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - query
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @param {Object} options.user - user data
   * @return {Message}
   */
  async launch(message, query, {guild, user, levelingGuild}) {
    if (query.join('') === 'global') {
      const levelingUser = await LevelingUser.find();
      /**
       * All board levelingUser and sort
       * @type {Array<object>}
       */
      const rawBoard = levelingUser.sort((a, b) =>
        b.messageCount - a.messageCount);
      const embed = {
        title: language(guild.lg, 'command_top_embedglobal_title'),
        color: guild.color,
        fields: [],
      };
      const users = await this.client.fetchUsers;
      let index = 0;
      for (const user of rawBoard.slice(0, 6)) {
        index++;
        embed.fields.push({
          name: `${index === 1 ?
            '🥇' : index === 2 ?
            '🥈' : index === 3 ?
            '🥉': ''}#${Number(index)} - ${
            users.find((u) => u.id === user.id).username}`,
          value: `${calculatepoint(user.messageCount).xp} xp`,
          inline: false,
        });
      };
      message.channel.send({embed});
    } else {
      /**
       * All board levelingGuild and sort
       * @type {Array<object>}
       */
      const rawBoard = levelingGuild.users.sort((a, b) =>
        b.messageCount - a.messageCount);
      const embed = {
        title: language(guild.lg, 'command_top_embed_title')
            .replace(/{{server}}/gi, message.guild.name),
        color: guild.color,
        fields: [],
      };
      const users = await this.client.fetchUsers;
      let index = 0;
      for (const user of rawBoard.slice(0, 6)) {
        index++;
        embed.fields.push({
          name: `${index === 1 ?
            '🥇' : index === 2 ?
            '🥈' : index === 3 ?
            '🥉': ''}#${Number(index)} - ${
            users.find((u) => u.id === user.id).username}`,
          value: `${calculatepoint(user.messageCount).xp} xp`,
          inline: false,
        });
      };
      message.channel.send({embed});
    };
  };
};
