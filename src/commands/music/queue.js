'use strict';
const corePlayer = require('./../../plugin/Music');
const Command = require('../../plugin/Command');
const Discord = require('discord.js');

/**
 * Command class
 */
module.exports = class Queue extends Command {
  /**
     * @param {Discord.Client} client - Client
     */
  constructor(client) {
    super(client, {
      name: 'queue',
      category: 'music',
      description: 'command_queue_description',
      usage: 'queue',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: [],
      userPerm: [],
    });
    this.client = client;
  };
  /**
     * @param {Discord.Message} message - message
     * @return {Promise<Discord.Message>}
     */
  async launch(message) {
    const player = corePlayer.initPlayer(this.client, message.guild.id);
    if (!player.queue || player.queue.length <= 0) {
      return message.channel.send(`The queue is empty`);
    };
    let totalTime = 0;
    player.queue.map((v) => totalTime = totalTime + v.time/1000);
    const queueEmbed = new Discord.MessageEmbed()
        .setTitle(`${message.guild.name} queue`)
        .setDescription(player.queue.map((v, i) =>
          `[${i+1}] ${v.title} - request by ${v.member}`))
        .addField('Playlist time', `${corePlayer.parseSeconde(totalTime)}`);
    message.channel.send({embed: queueEmbed});
  };
};
