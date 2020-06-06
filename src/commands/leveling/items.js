'use strict';
const Command = require('../../plugin/Command');

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
    const member = message.mentions.members.first() || message.member;
    user = await this.client.getUser(member);
    const items = user.items;
    if (!items || items.length === 0) return message.react('💢');
    query.shift();
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
  };
};
