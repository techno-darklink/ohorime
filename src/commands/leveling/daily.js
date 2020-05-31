'use strict';
const Command = require('../../plugin/Command');
const language = require('./../../i18n');
const moment = require('moment');

/**
 * Command class
 */
module.exports = class Daily extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'daily',
      category: 'leveling',
      description: 'command_daily_description',
      usage: 'daily',
      nsfw: false,
      enable: true,
      guildOnly: false,
      aliases: [],
      mePerm: [],
    });
    this.client = client;
    this.bonus = [
      '',
      '🇦',
      '🇦 🇼',
      '🇦 🇼 🇦',
      '🇦 🇼 🇦 🇷',
      '🇦 🇼 🇦 🇷 🇩',
    ];
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - query
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @param {Object} options.user - user data
   * @return {Message}
   */
  async launch(message, query, {guild, user}) {
    // 86400000
    if (Date.now() < (user.daily.timeout + 86400000)) {
      // eslint-disable-next-line max-len
      return message.channel.send(
          language(guild.lg, 'command_daily_wait')
              .replace(/{{time}}+/g,
                  moment((user.daily.timeout+86400000)-Date.now())
                      .format('h:mm:ss')),
      );
    };
    if ((Date.now() > (user.daily.timeout+86400000*2))) {
      user.daily.count = 1;
      user.daily.timeout = Date.now();
      message.channel.send({
        embed: {
          color: guild.color,
          title: language(guild.lg, 'command_daily_msg'),
          description: `${this.bonus[user.daily.count-1]}`,
        },
      });
      this.client.updateUser(message.author, {
        daily: user.daily,
        coins: user.coins+2500,
      });
    } else if (user.daily.count < 5) {
      user.daily.count++;
      user.daily.timeout = Date.now();
      message.channel.send({
        embed: {
          color: guild.color,
          title: language(guild.lg, 'command_daily_msg'),
          description: this.bonus[user.daily.count-1],
        },
      });
      this.client.updateUser(message.author, {
        daily: user.daily,
        coins: user.coins+2500,
      });
    } else {
      user.daily.count++;
      user.daily.timeout = Date.now();
      message.channel.send({
        embed: {
          color: guild.color,
          title: language(guild.lg, 'command_daily_msg_bonus'),
          description: this.bonus[user.daily.count-1],
        },
      });
      user.daily.count = 1;
      this.client.updateUser(message.author, {
        daily: user.daily,
        coins: user.coins+5000,
      });
    };
  };
};
