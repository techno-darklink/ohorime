/* eslint-disable max-len */
'use strict';
const {Util} = require('node-anemy');
const event = require('./../plugin/Event');

/**
 * Event MessageReactionRemove
 */
module.exports = class MessageReactionRemove extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'messageReactionRemove',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
  * Launch script
  * @param {MessageReaction} messageReaction - message reaction
  * @param {User} user - user
  */
  async launch(messageReaction, user) {
    if (!messageReaction && !user) return;
    /**
     * Check if user is a bot
     */
    if (user.bot) return;
    /**
     * Check emoji reaction name
     */
    if (['left_arrow', 'right_arrow'].includes(messageReaction.emoji.name)) {
      /** Check type */
      if (this.client.pagination[user.id] === 'anime') {
        /**
         * If value is object
         */
        if (!this.client.anime[user.id]) {
          this.client.anime[user.id] = {};
        };
        /**
         * If there is a message
         */
        if (!this.client.anime[user.id].message) return;
        /**
         * If this message is deleted
         */
        if (messageReaction.message.channel.messages.fetch(this.client.anime[user.id].message.id).deleted) return;
        /**
         * Check if message is message reaction
         */
        if (messageReaction.message.id !==
        this.client.anime[user.id].message.id) return;
        /**
         * Get data
         */
        const data = this.client.anime[user.id].data;
        /**
         * Convert string
         * @param {string} d
         * @return {string}
         */
        function convert(d) {
          return Util.convertToMarkdown(Util.convertHtmlEntities(Util.reduceString(d, 2000)));
        };
        /**
         * Switch with emojis
         */
        switch (messageReaction.emoji.name) {
          case 'left_arrow':
            /**
             * Check if pagination is first or latest
             */
            if (this.client.anime[user.id].pagination === 0) {
              this.client.anime[user.id].pagination =
            data.length-1;
            } else {
              this.client.anime[user.id].pagination =
          this.client.anime[user.id].pagination-1;
            };
            break;
          case 'right_arrow':
            /**
             * Check if pagination is first or latest
             */
            if (this.client.anime[user.id].pagination === data.length-1) {
              this.client.anime[user.id].pagination = 0;
            } else {
              this.client.anime[user.id].pagination =
          this.client.anime[user.id].pagination+1;
            };
            break;
        };
        /**
             * Send message
             */
        if (this.client.anime[user.id].type === 'anime') {
          this.client.anime[user.id].message.edit({
            embed: {
              color: this.client.anime[user.id].color,
              // eslint-disable-next-line max-len
              title: convert(data[this.client.anime[user.id].pagination].romaji +
                '  -  ID: ' +
                data[this.client.anime[user.id].pagination].id),
              description: convert(data[
                  // eslint-disable-next-line max-len
                  this.client.anime[user.id].pagination].description || 'aucune donnée'),
              url: `https://anemy.fr/anime.php?id=${data[this.client.anime[user.id].pagination].id}`,
              thumbnail: data[this.client.anime[user.id].pagination].affiche ?
                    {url: encodeURI(data[this.client.anime[user.id].pagination].affiche)} :
                    {},
              image: data[this.client.anime[user.id].pagination].image ?
                    {url: encodeURI(data[this.client.anime[user.id].pagination].image)} :
                    {},
              fields: [
                {
                  name: 'episodes',
                  value: convert(data[
                      this.client.anime[user.id].pagination].episodes || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'statut',
                  value: convert(data[
                      this.client.anime[user.id].pagination].statut || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'licence',
                  value: convert(data[
                      this.client.anime[user.id].pagination].licence || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'saison',
                  value: convert(data[
                      this.client.anime[user.id].pagination].statut || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'studio',
                  value: convert(data[
                      this.client.anime[user.id].pagination].studio || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'producteur',
                  value: convert(data[
                      // eslint-disable-next-line max-len
                      this.client.anime[user.id].pagination].producteur || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'source',
                  value: convert(data[
                      this.client.anime[user.id].pagination].source || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'durée',
                  value: convert(data[
                      this.client.anime[user.id].pagination].duree || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'categorie',
                  value: convert(data[
                      this.client.anime[user.id].pagination].categorie || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'format',
                  value: convert(data[
                      this.client.anime[user.id].pagination].format || 'aucune donnée'),
                },
                {
                  name: 'pays',
                  value: convert(data[
                      this.client.anime[user.id].pagination].pays || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'adulte',
                  value: data[
                      // eslint-disable-next-line max-len
                      this.client.anime[user.id].pagination].adulte===0?
                      'Non' : 'Oui',
                  inline: true,
                },
              ],
              footer: {
                // eslint-disable-next-line max-len
                text: `Powered by Anemy - page ${this.client.anime[user.id].pagination+1}/${data.length}`,
                icon_url: 'https://gblobscdn.gitbook.com/spaces%2F-M4jTJ1TeTR2aTI4tuTG%2Favatar-1586713303918.png?generation=1586713304401821&alt=media',
              },
            },
          });
        } else {
          this.client.anime[user.id].message.edit({
            embed: {
              color: this.client.anime[user.id].color,
              title: convert(data[this.client.anime[user.id].pagination].prenom +
                ' '+
                data[this.client.anime[user.id].pagination].nom +
                '  -  ID: ' +
                data[this.client.anime[user.id].pagination].id + ' · ' +
                data[this.client.anime[user.id].pagination].id_page.slice(1, data[this.client.anime[user.id].pagination].id_page.length-1)),
              description: convert(data[
                  this.client.anime[user.id].pagination].biographie || 'aucune donnée'),
              url: this.client.anime[user.id].type === 'personnage' ?
                `https://anemy.fr/personnage.php?id=${data[this.client.anime[user.id].pagination].id}` :
                `https://anemy.fr/staff.php?id=${data[this.client.anime[user.id].pagination].id}`,
              thumbnail: {
                url: data[this.client.anime[user.id].pagination].image ?
                      encodeURI(data[this.client.anime[user.id].pagination].image) :
                      'https://cdn.anemy.fr/staff/affiche/SANS-IMAGE.png',
              },
              fields: [
                {
                  name: 'native',
                  value: convert(data[
                      this.client.anime[user.id].pagination].native || 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'alternative',
                  value: convert(data[
                      this.client.anime[user.id].pagination].alternative|| 'aucune donnée'),
                  inline: true,
                },
                {
                  name: 'liked',
                  value: convert(data[
                      this.client.anime[user.id].pagination].liked || 'aucune donnée'),
                  inline: true,
                },
              ],
              footer: {
                // eslint-disable-next-line max-len
                text: `Powered by Anemy - page ${this.client.anime[user.id].pagination+1}/${data.length}`,
                icon_url: 'https://gblobscdn.gitbook.com/spaces%2F-M4jTJ1TeTR2aTI4tuTG%2Favatar-1586713303918.png?generation=1586713304401821&alt=media',
              },
            },
          });
        };
      } else if (this.client.pagination[user.id] === 'leveling') {
        /**
         * If value is object
         */
        if (!this.client.items[user.id]) {
          this.client.items[user.id] = {};
        };
        /**
         * If there is a message
         */
        if (!this.client.items[user.id].message) return;
        /**
         * If this message is deleted
         */
        if (messageReaction.message.channel.messages.fetch(this.client.items[user.id].message.id).deleted) return;
        /**
         * Check if message is message reaction
         */
        if (messageReaction.message.id !==
        this.client.items[user.id].message.id) return;
        /**
         * Switch with emojis
         */
        switch (messageReaction.emoji.name) {
          case 'left_arrow':
            /**
             * Check if pagination is first or latest
             */
            if (this.client.items[user.id].pagination === 0) {
              this.client.items[user.id].pagination =
              this.client.items[user.id].data.length-1;
            } else {
              this.client.items[user.id].pagination =
          this.client.items[user.id].pagination-1;
            };
            break;
          case 'right_arrow':
            /**
             * Check if pagination is first or latest
             */
            if (this.client.items[user.id].pagination ===
                this.client.items[user.id].data.length-1) {
              this.client.items[user.id].pagination = 0;
            } else {
              this.client.items[user.id].pagination =
          this.client.items[user.id].pagination+1;
            };
            break;
        };
        const embed = {
          title: `ID: ${
            this.client.items[user.id].data[
                this.client.items[user.id].pagination
            ].id
          } - ${
            this.client.items[user.id].data[
                this.client.items[user.id].pagination
            ].category
          }`,
          url: this.client.items[user.id].data[
              this.client.items[user.id].pagination
          ].extension.includes('gif') ?
        `https://cdn.ohori.me/store/${
          this.client.items[user.id].data[
              this.client.items[user.id].pagination
          ].id}.gif` :
        `https://cdn.ohori.me/store/${
          this.client.items[user.id].data[
              this.client.items[user.id].pagination
          ].id}.png`,
          color: this.client.items[user.id].color,
          image: {
            url: this.client.items[user.id].data[
                this.client.items[user.id].pagination
            ].extension.includes('gif') ?
            `https://cdn.ohori.me/store/${
              this.client.items[user.id].data[
                  this.client.items[user.id].pagination
              ].id}.gif` :
            `https://cdn.ohori.me/store/${
              this.client.items[user.id].data[
                  this.client.items[user.id].pagination
              ].id}.webp`,
          },
        };
        this.client.items[user.id].message.edit({embed});
      };
    };
  };
};
