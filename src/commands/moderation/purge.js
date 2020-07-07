'use strict';
const Command = require('../../plugin/Command');

/**
 * Command class
 */
module.exports = class Purge extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'purge',
      category: 'moderation',
      description: 'command_purge_description',
      usage: 'purge (number) [...mentions channel]',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
      userPerm: ['MANAGE_MESSAGES'],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array<string>} query - arguments
   * @return {Promise<Message>}
   */
  launch(message, query) {
    if (message.mentions.channels.size > 0) {
      return message.mentions.channels.each(async (channel) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return channel.bulkDelete(parseInt(query[0]), true).then((messages) => {
          message.channel.send(`✅ | [${
            channel.parent ?
            `${channel.parent.name}/${channel.toString()}` :
            `${channel.toString()}`}] Bulk deleted ${messages.size} messages`)
              .then((msg) => {
                msg.delete({timeout: 5000})
                    .catch((err) => {/* message has been already deleted */});
              }).catch((err) => message.channel.send(
                  `❌ | [${
                    channel.parent ?
                    `${channel.parent.name}/${channel.toString()}` :
                    `${channel.toString()}`}] I can't bulk delete`));
        });
      });
    } else {
      return message.channel.bulkDelete(parseInt(query.join(''))+1, true)
          .then((messages) => {
            message.channel.send(
                `✅ | [${
                  message.channel.toString()
                }] Bulk deleted ${
                  messages.size} messages (your message is include)`)
                .then((msg) => {
                  msg.delete({timeout: 5000})
                      .catch((err) => {/* message has been already deleted */});
                });
          }).catch((err) => message.channel.send(
              `❌ | [${message.channel.toString()}] I can't bulk delete`));
    };
  };
};
