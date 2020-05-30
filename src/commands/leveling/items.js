'use strict';
const Command = require('../../plugin/Command');
const language = require('./../../i18n');

/**
 * Command class
 */
module.exports = class Items extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'items',
      category: 'leveling',
      description: 'command_items_description',
      usage: 'items (id)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      aliases: ['item', 'inventory'],
      mePerm: [],
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
  async launch(message, query, {guild, user}) {
    const items = user.items;
    if (!query.join('')) {
      this.client.pagination[message.author.id] = 'leveling';
      this.client.items[message.author.id] = {
        pagination: 0,
        message: null,
        data: items,
        color: guild.color,
      };
      const embed = {
        title: `ID: ${
          this.client.items[message.author.id].data[
              this.client.items[message.author.id].pagination
          ].id
        } - ${
          this.client.items[message.author.id].data[
              this.client.items[message.author.id].pagination
          ].category
        }`,
        color: this.client.items[message.author.id].color,
        url: this.client.items[message.author.id].data[
            this.client.items[message.author.id].pagination
        ].extension.includes('gif') ?
        `https://cdn.ohori.me/store/${
          this.client.items[message.author.id].data[
              this.client.items[message.author.id].pagination
          ].id}.gif` :
        `https://cdn.ohori.me/store/${
          this.client.items[message.author.id].data[
              this.client.items[message.author.id].pagination
          ].id}.png`,
        image: {
          url: this.client.items[message.author.id].data[
              this.client.items[message.author.id].pagination
          ].extension.includes('gif') ?
            `https://cdn.ohori.me/store/${
              this.client.items[message.author.id].data[
                  this.client.items[message.author.id].pagination
              ].id}.gif` :
            `https://cdn.ohori.me/store/${
              this.client.items[message.author.id].data[
                  this.client.items[message.author.id].pagination
              ].id}.webp`,
        },
      };
      this.client.items[message.author.id].message =
        await message.channel.send({embed});
      await this.client.items[message.author.id].message
          .react('704554846073782362');
      await this.client.items[message.author.id].message
          .react('704554845813866506');
    } else {
      const item = items.findIndex((i) => i.id === query.join(''));
      if (item === -1) {
        return message.reply(
            language(guild.lg, 'command_items_notFound'),
        );
      };
      const embed = {
        title: `ID: ${items[item].id} - ${items[item].category}`,
        color: guild.color,
        image: {
          url: items[item].extension.includes('gif') ?
            `https://cdn.ohori.me/store/${items[item].id}.gif` :
            `https://cdn.ohori.me/store/${items[item].id}.webp`,
        },
      };
      message.channel.send({embed});
    };
  };
};
