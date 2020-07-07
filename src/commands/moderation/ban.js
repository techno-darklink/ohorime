'use strict';
const Command = require('../../plugin/Command');

/**
 * Command class
 */
module.exports = class Ban extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'ban',
      category: 'moderation',
      description: 'command_ban_description',
      usage: 'ban (...mentions member) <-days -reason>',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: ['BAN_MEMBERS'],
      userPerm: ['BAN_MEMBERS'],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array<string>} query - arguments
   * @return {Promise<Message>|GuildMember}
   */
  async launch(message, query) {
    message.mentions.members.each(async (member) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (message.member.roles.highest.position <
          member.roles.highest.position &&
          message.member.id !== message.guild.ownerID) {
        return message.channel.send(
            `❌ | [${
              member.user.tag
            }] You cannot banish someone with a higher position than you`);
      };
      if (message.guild.me.roles.highest.position <
        member.roles.highest.position) {
        return message.channel.send(
            `❌ | [${
              member.user.tag
            }] I have lower permissions than the user`);
      };
      if (!member.bannable) {
        return message.channel.send(`❌ | [${
          member.user.tag
        }] I cannot ban this member`);
      };
      let serialize = query.join(' ');
      serialize = serialize.split(/-+/g);
      serialize.shift();
      const mapping = [];
      serialize.map((v) =>
        mapping.push([v.split(/ +/g).shift()
            .trim().toLowerCase(), v.split(/ +/g).slice(1).join(' ')]));
      return member.ban(Object.fromEntries(mapping)).then(() => {
        return message.channel.send(`✅ | [${
          member.user.tag
        }] This user has been successfully banned`);
      }).catch((e) => {
        message.channel.send(`❌ | [${
          member.user.tag
        }] A problem occurred while trying to ban the userd`);
        return message.channel.send(e.stack, {code: 'js'});
      });
    });
  };
};
