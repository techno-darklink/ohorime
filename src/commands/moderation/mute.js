'use strict';
const Command = require('../../plugin/Command');
const ms = require('ms');

/**
 * Command class
 */
module.exports = class Mute extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'mute',
      category: 'moderation',
      description: 'command_mute_description',
      usage: ['mute (...mentions members) <-time>'],
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
    const awaitInit = new Promise(async (resolve) => {
      let _muteRole = message.guild.roles.cache
          .find((role) => role.name === 'mute');
      if (!_muteRole) {
        _muteRole = await message.guild.roles.create({
          data: {
            name: 'mute',
            color: '#000',
            hoist: false,
            mentionable: false,
            permissions: [],
          },
          reason: 'Ohorime create mute role :)',
        });

        await message.guild.channels.cache.each(async (channel) => {
          await new Promise((resolve) => setTimeout(resolve, 750));
          channel.createOverwrite(_muteRole, {
            SEND_MESSAGES: false,
            SPEAK: false,
            ADD_REACTIONS: false,
            USE_VAD: false,
          }, 'Ohorime edit permissions for mute role :)');
        });
        resolve(_muteRole);
      } else {
        return resolve(_muteRole);
      };
    });
    let serialize = query.join(' ');
    serialize = serialize.split(/-+/g);
    serialize.shift();
    const mapping = [];
    serialize.map((v) =>
      mapping.push([v.split(/ +/g).shift()
          .trim().toLowerCase(), v.split(/ +/g).slice(1).join(' ')]));
    const time = Object.fromEntries(mapping).time || '1h';

    awaitInit.then((muteRole) => {
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
        this.client.mute[member.id] = {
          timeout: null,
          roles: member.roles.cache,
        };
        await member.roles.set([], 'Ohorime set roles for mute :)')
            .catch((err) => message.channel.send(`❌ | [${
              member.toString()}] can't set roles`)).then(() => {

            });
        await member.roles.add(muteRole).then(() => {
          member.send(`you are mute while ${
            ms(ms(time, {long: true}))} on ${message.guild.name}`)
              .catch((err) => {/* User block mp */});
          return message.channel.send(`✅ | [${member.toString()}] mute while ${
            ms(ms(time, {long: true}))}`);
        }).catch(() => {
          return message.channel.send(
              `❌ | [${member.toString()}] I can't add mute role`);
        });
        this.client.mute[member.id].timeout = setTimeout(() => {
          member.roles.remove(muteRole).then(() => {
            member.send(`You can send message on ${message.guild.name}`)
                .catch((err) => {/* User block mp */});
            member.roles.set(this.client.mute[member.id].roles.map((v) => v))
                .catch((err) => message.channel.send(`❌ | [${
                  member.toString()}] can't set roles`));
            delete this.client.mute[member.id];
            return message.channel.send(`✅ | [${
              member.toString()}] can now send message`).then((msg) => {
              msg.delete({timeout: 5000})
                  .catch((err) => {/* message has been already deleted */});
            });
          }).catch((err) => {
            return message.channel.send(`❌ | [${
              member.toString()}] can't remove mute role`);
          });
        }, ms(time));
      });
    });
  };
};
