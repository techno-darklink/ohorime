'use strict';
const Command = require('../../plugin/Command');

/**
 * Command class
 */
module.exports = class SetEmoji extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'createemoji',
      category: 'moderation',
      description: 'command_createemoji_description',
      usage: [
        // eslint-disable-next-line max-len
        'createemoji (image attachement) (name) <-roles (...mentions roles) -reason (reason)>',
      ],
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: ['cemoji'],
      mePerm: ['MANAGE_EMOJIS'],
      userPerm: ['MANAGE_EMOJIS'],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array<string>} query - arguments
   * @param {Object} params - commands params
   * @return {Promise<Message>}
   */
  launch(message, query, params) {
    if (!query.join('') && message.attachments.size < 1) {
      return message.channel.send({embed: this.badUsage});
    };
    let url;
    // eslint-disable-next-line max-len
    if (query[0] && query[0].match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g) !== null) {
      url = query.shift();
    } else if (message.attachments.size > 0) {
      url = message.attachments.first().url;
    } else {
      return message.channel.send({embed: this.badUsage});
    };

    if (!query.join(' ').split(/-/g)[0]) {
      return message.channel.send('Please enter a **name** for your emoji');
    };

    return message.guild.emojis.create(url, query.shift(), params.roles ? {
      roles: message.mentions.roles,
      reason: params.reason ? params.reason : 'Ohorime create this role :)',
    } : {
      reason: params.reason ? params.reason : 'Ohorime create this role :)',
    }).then((emoji) => {
      return message.channel.send(
          `✅ | [${emoji.toString()}] is added on this server`);
    }).catch((err) => {
      return message.channel.send(
          `❌ | I can't add this emoji on this server${
            err.code === 50035 ?
            ' : must file cannot be larger than 256.0 kb' : ''}`,
      );
    });
  };
};
