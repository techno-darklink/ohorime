/* eslint-disable */
'use strict';
const Command = require('../../plugin/Command');
const language = require('../../i18n');
const {Util} = require('node-anemy');

/**
 * Command class
 */
module.exports = class Anime extends Command {
  /**
     * @param {Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'anime',
      category: 'japanese',
      description: 'command_anime_description',
      usage: 'anime (params)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      aliases: [],
      mePerm: ['EMBED_LINKS', 'ADD_REACTIONS'],
    });
    this.client = client;
  };
  /**
     * @param {Message} message - message
     * @param {Array} query - query
     * @param {Object} options - options
     * @param {Object} options.guild - guild data
     * @return {Message}
     */
  async launch(message, query, {guild}) {
    if (!query.join('')) {
      return message.channel.send({
        embed: {
          color: guild.color,
          title: language(guild.lg, 'command_anime_embed_title'),
          // eslint-disable-next-line max-len
          description: language(guild.lg, 'command_anime_embed_description')
            .replace(/{{param}}+/g, '\n`id`: [nombre],\n`romanji` [caractère],\n`épisode` [nomber]\n`days_starts` [nombre] c\'est le jour de début de diffusion de l\'anime,\n`months_starts` [nombre] c\'est le mois de début de diffusion de l\'anime,\n`years_starts` [nombre] c\'est l\'année de début de diffusion de l\'anime,\n`days_ends` [nombre] c\'est le jour de fin de diffusion de l\'anime,\n`months_ends` [nombre] c\'est le mois de fin de diffusion de l\'anime,\n`years_ends` [nombre] c\'est l\'année de fin de diffusion de l\'anime,\n`statut` [caractère] Terminé, Sortie en cours, Pas sortie, Annulé,\n`season` [caractère] Hiver 2019, Printemps 2019, Été 2019, Automne 2019, ... Et toutes les années possibles,\n`studio` [caractère],\n`source` [caractère],\n`duree` [nombre],\n`category` [caractère],\n`format` [caractère] Série TV, Film, OAV, ONA, Spécial, Musique,\n`country` [caractère] Japon, Chine, Corée du Sud, Taïwan, France, Autre,\n`adult` [nombre] 0 ou 1 (1 c\'est que l\'animé est +18 et 0 non !)\n\nexemple: `'+
            guild.prefix + 'anime -format Série TV`'),
          footer: {
            text: language(guild.lg, 'command_anime_embed_footer'),
            icon_url: 'https://gblobscdn.gitbook.com/spaces%2F-M4jTJ1TeTR2aTI4tuTG%2Favatar-1586713303918.png?generation=1586713304401821&alt=media',
          },
        },
      });
    };
    let serialize = query.join(' ');
    serialize = serialize.split(/-+/g);
    serialize.shift();
    const mapping = [];
    serialize.map((v) => mapping.push([v.split(/ +/g).shift().trim().toLowerCase(), v.split(/ +/g).slice(1).join(' ')]));
    const params = Object.fromEntries(mapping);
    let data = await this.client.anemy.getAnime(params);
    if (!data) {
      return message.channel.send(
        language(guild.lg, 'command_anime_result_any')
      );
    };
    if (data.isAxiosError) {
      return message.channel.send(
        language(guild.lg, 'command_anime_result_error'),
      );
    };
    if (data.length < 1) {
      return message.channel.send(
        language(guild.lg, 'command_anime_result_any'),
      );
    };
    var result = [];
    if (!data.result) result.push(data);
    data = data.result || result;
    if (!data || data.length < 1) {
      return message.channel.send(
        language(guild.lg, 'command_anime_result_any'),
      );
    };
    this.client.pagination[message.author.id] = 'anime';
    this.client.anime[message.author.id] = {
      message: null,
      pagination: 0,
      data,
      type: 'anime',
      color: guild.color,
    };
    function convert (d) {
      return Util.convertToMarkdown(
        Util.convertHtmlEntities(
          Util.reduceString(d, 2000)));
    };
    const embed = {
      color: this.client.items[message.author.id].color,
      title: convert(
            data[this.client.anime[message.author.id].pagination].romaji +
        '  -  ID: ' +
        data[this.client.anime[message.author.id].pagination].id, 2000),
      description: convert(data[
            this.client.anime[message.author.id].pagination].description  || 'aucune donnée'),
      url: `https://anemy.fr/anime.php?id=${data[this.client.anime[message.author.id].pagination].id}`,
      thumbnail: data[this.client.anime[message.author.id].pagination].affiche ?
        { url: encodeURI(data[this.client.anime[message.author.id].pagination].affiche) } :
        {},
      image: data[this.client.anime[message.author.id].pagination].image ?
        { url: encodeURI(data[this.client.anime[message.author.id].pagination].image) } :
        {},
      fields: [
        {
          name: 'episodes',
          value: convert(data[
              this.client.anime[message.author.id].pagination].episodes || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'statut',
          value: convert(data[
              this.client.anime[message.author.id].pagination].statut || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'licence',
          value: convert(data[
              this.client.anime[message.author.id].pagination].licence || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'saison',
          value: convert(data[
              this.client.anime[message.author.id].pagination].saison || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'studio',
          value: convert(data[
              this.client.anime[message.author.id].pagination].studio || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'producteur',
          value: convert(data[
              this.client.anime[message.author.id].pagination].producteur || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'source',
          value: convert(data[
              this.client.anime[message.author.id].pagination].source || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'durée',
          value: convert(data[
              this.client.anime[message.author.id].pagination].duree || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'categorie',
          value: convert(data[
              this.client.anime[message.author.id].pagination].categorie || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'format',
          value: convert(data[
              this.client.anime[message.author.id].pagination].format || 'aucune donnée'),
        },
        {
          name: 'pays',
          value: convert(data[
              this.client.anime[message.author.id].pagination].pays || 'aucune donnée'),
          inline: true,
        },
        {
          name: 'adulte',
          value: data[
              this.client.anime[message.author.id].pagination].adulte===0?
              'Non' : 'Oui',
          inline: true,
        },
      ],
      footer: {
        // eslint-disable-next-line max-len
        text: language(guild.lg, 'command_anime_result_embed_footer')
            .replace(/{{index}}+/g, `${this.client.anime[message.author.id].pagination+1}/${data.length}`),
        icon_url: 'https://gblobscdn.gitbook.com/spaces%2F-M4jTJ1TeTR2aTI4tuTG%2Favatar-1586713303918.png?generation=1586713304401821&alt=media',
      },
    };
    this.client.anime[message.author.id].message =
      await message.channel.send({embed});
    if (data.length > 1) {
      await this.client.anime[message.author.id].message
          .react('704554846073782362');
      await this.client.anime[message.author.id].message
          .react('704554845813866506');
    };
  };
};
