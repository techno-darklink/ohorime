'use strict';
const Command = require('../../plugin/Command');
const language = require('../../i18n');

/**
 * Command class
 */
module.exports = class Skip extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'skip',
      category: 'music',
      description: 'command_skip_description',
      usage: 'skip',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: [
        'ADD_REACTIONS',
      ],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - argument
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @return {Message}
   */
  async launch(message, query, {guild, guildPlayer}) {
    if (!this.client.music[message.guild.id]) return message.react('💢');
    if (this.client.music[message.guild.id].dispatcher === null) {
      return message.reply(language(guild.lg, 'command_music_notPlaying'));
    };
    const player = new (require('./play'))(this.client);
    if (!player.hasPermission(message)) {
      return message.channel.send(
          language(guild.lg, 'command_skip_noPermission'),
      );
    };
    if (this.client.music[message.guild.id].broadcast) {
      return message.reply('⚠️');
    };
    switch (guildPlayer.player_loop) {
      case 'off':
        guildPlayer.player_history.shift();
        guildPlayer =
          await player.updateQueue(guildPlayer.player_history, message);
        player.play(message, guildPlayer, guild);
        break;
      default:
        await this.client.music[message.guild.id].dispatcher.destroy();
        guildPlayer =
          await player.updateQueue(guildPlayer.player_history, message);
        if (this.client.music[message.guild.id].index ===
            guildPlayer.player_history.length - 1) {
          this.client.music[message.guild.id].index = 0;
        } else {
          this.client.music[message.guild.id].index++;
        };
        player.play(message, guildPlayer, guild);
        break;
    }
  };
};
