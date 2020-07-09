'use strict';
const Command = require('../../plugin/Command');

/**
 * Command class
 */
module.exports = class UnMute extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'unmute',
      category: 'moderation',
      description: 'command_unmute_description',
      usage: ['unmute (...mentions members)'],
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: ['MANAGE_ROLES'],
      userPerm: ['MANAGE_ROLES'],
    });
    this.client = client;
  };
  /**
   * @async
   * @param {Message} message - message
   * @param {Array<string>} query - arguments
   * @return {Promise<Message>}
   */
  async launch(message, query) {
    if (!query.join('') || message.mentions.members.size < 1) {
      return message.channel.send({embed: this.badUsage});
    };
    const muteRole = message.guild.roles.cache
        .find((role) => role.name === 'mute');
    if (!muteRole) {
      return message.channel.send(`Role mute does not exist`);
    }
    return message.mentions.members.each(async (member) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (message.member.roles.highest.position <
            member.roles.highest.position &&
            message.member.id !== message.guild.ownerID) {
        return message.channel.send(
            `❌ | [${
              member.user.tag
            }] You cannot mute someone with a higher position than you`);
      };
      if (message.guild.me.roles.highest.position <
          member.roles.highest.position) {
        return message.channel.send(
            `❌ | [${
              member.user.tag
            }] I have lower permissions than the user`);
      };
      if (!this.client.mute[member.id]) {
        // eslint-disable-next-line max-len
        message.channel.send(`⚠️ | [${member.toString()}] is not register to mute, I can remove mute role if has this role, but I can't give these latter roles`);
      };
      await member.roles.remove(muteRole).then(() => {
        member.send(`You can send message on ${message.guild.name}`)
            .catch((err) => {/* User block mp */});
        if (this.client.mute[member.id]) {
          member.roles.set(this.client.mute[member.id].roles.map((v) => v))
              .catch((err) => message.channel.send(`❌ | [${
                member.toString()}] can't set roles`));
        };
        return message.channel.send(`✅ | [${
          member.toString()}] can now send message`).then((msg) => {
          msg.delete({timeout: 5000})
              .catch((err) => {/* message has been already deleted */});
        });
      }).catch(() => {
        return message.channel.send(
            `❌ | [${member.toString()}] I can't remove mute role`);
      });
      if (this.client.mute[member.id]) {
        clearInterval(this.client.mute[member.id].timeout);
        delete this.client.mute[member.id];
      }
    });
  };
};
