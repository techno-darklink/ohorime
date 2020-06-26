'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Destroy extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'destroy',
      category: 'music',
      description: 'command_destroy_description',
      usage: 'destroy',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
      userPerm: [],
    });
    this.client = client;
  };
  /**
     * @param {Discord.Message} message - message
     * @return {Promise<Discord.Message>}
     */
  async launch(message) {
    if (!message.member.voice.channel) return message.reply('💢');
    const player = corePlayer.initPlayer(this.client, message.guild.id);
    if (!player.dispatcher) return message.channel.send(`I don't play a music`);
    if (!corePlayer.hasPermission(this.client, message)) {
      const call = await corePlayer.callRequest(message,
          new Discord.MessageEmbed(), {
            required: `Require {{mustVote}} votes for destroy the stream`,
            complete: `Vote completed, you destroy the stream`,
            content: `Vote {{haveVoted}}/{{mustVote}}`,
          });
      if (call) {
        if (!player.dispatcher) {
          return message.channel.send(`I don't play a music`);
        };
        player.dispatcher.destroy();
        message.member.voice.channel.leave();
        this.client.music[message.guild.id] = {
          queue: [],
          index: 0,
          isPlaying: false,
          volume: 0.50,
          type: null,
          dispatcher: false,
          connection: false,
          loop: 'off',
          broadcast: false,
          muteIndicator: false,
          backup: {
            index: null,
            seek: null,
          },
        };
      } else {
        return message.channel.send(`You don't destroy the stream`);
      };
    } else {
      player.dispatcher.destroy();
      message.member.voice.channel.leave();
      this.client.music[message.guild.id] = {
        queue: [],
        index: 0,
        isPlaying: false,
        volume: 0.50,
        type: null,
        dispatcher: false,
        connection: false,
        loop: 'off',
        broadcast: false,
        muteIndicator: false,
        backup: {
          index: null,
          seek: null,
        },
      };
    };
  };
};
