/* eslint-disable max-len */
'use strict';
const Command = require('../../plugin/Command');
const ms = require('ms');
const moment = require('moment');
const Warns = require('./../../database/lib').Warn;

/**
 * @typedef Warn
 * @property {number} id
 * @property {string} memberID
 * @property {string} [reason=No reason specified]
 * @property {string} channelID
 * @property {string} warner
 * @property {string} warnerID
 * @property {number} time
 * @property {number} now
 */

/**
 * @typedef WarnGroup
 * @property {string} userID
 * @property {string} guildID
 * @property {number} totalWarn
 * @property {Array<Warn>} history
 * @property {Array<Warn>} active
 */

/**
 * Command class
 */
module.exports = class Warn extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'warn',
      category: 'moderation',
      description: 'command_warn_description',
      usage: [
        '**warn** (mention member)',
        '**warn add** (...mentions members) <-reason -time>',
        '**warn remove** (mention member) (id)',
        '**warn fetch** <-warner (mention member) | -warnID (warn id) | -userID (user id) | -warnerID (user id) | -reason (reason)>',
        '**warn history** (mention member)',
      ],
      exemple: [
        '`warn @nova`',
        '`warn add @nova -reason hard dab -time 1d`',
        '`warn remove @nova 3 -reason good boy`',
        '`warn fetch -warner @superAdmin -reason dab`',
        '`warn history @nova`',
      ],
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: [],
      userPerm: ['MANAGE_MESSAGES'],
    });

    client.once('ready', () => {
      this._init();
    });

    this.client = client;
  };
  /**
   * Relaunch timeout
   */
  async _init() {
    const $packetWarns = await Warns.find({guildID: {$in: this.client.guilds.cache.map((v) => v.id)}});
    // eslint-disable-next-line guard-for-in
    for (let $warns in $packetWarns) {
      $warns = $packetWarns[$warns];
      if (!this.client.warn[$warns.userID]) {
        this.client.warn[$warns.userID] = [];
      };
      // eslint-disable-next-line guard-for-in
      for (let $warn in $warns.active) {
        $warn = $warns.active[$warn];
        const $weep = {
          id: $warns.id,
          timeout: setTimeout(async () => {
            const guild = this.client.guilds.cache.get($warns.guildID);
            let channel = null;
            let member = $warns.userID;
            if (guild) {
              channel = guild.channels.cache.get($warn.channelID);
            };
            if (guild) {
              member = guild.members.cache.get($warns.userID);
            };
            const _warns = await this.client.getWarn({id: $warns.userID}, {id: $warns.guildID});
            const index = _warns.active.findIndex((swarn) => swarn.id === $warn.id);
            if (index === -1) {
              if (channel) {
                return channel.send(`❌ | [${member ? member.toString() : member}] I can't unwarn this user`);
              };
              return null;
            };
            _warns.active.splice(index, 1);
            this.client.updateWarn({id: $warns.userID}, {id: $warns.guildID}, _warns).then(() => {
              if (channel) {
                return channel.send(`✅ | [${member ? member.toString() : member}] is now unwarn - ID: ${$warn.id}`);
              };
              return null;
            }).catch(() => {
              if (channel) {
                return channel.send(`❌ | [${member ? member.toString() : member}] I can't unwarn - ID: ${$warn.id}`);
              };
            });
            const i = this.client.warn[$warns.userID].findIndex((swarn) => swarn.id === $warn.id);
            this.client.warn[$warns.userID].splice(i, 1);
            if (this.client.warn[$warns.userID].length < 1) {
              delete this.client.warn[$warns.userID];
            };
          }, ((parseInt($warn.time) + parseInt($warn.now)) - Date.now())+1000 < 1 ? 1 : ((parseInt($warn.time) + parseInt($warn.now)) - Date.now())+1000),
        };
        this.client.warn[$warns.userID].push($weep);
      };
    };
  }
  /**
   * @param {Message} message - message
   * @param {Array<string>} query - arguments
   * @param {Object} options
   * @param {string} options.reason
   * @param {string|number} options.time
   * @return {Promise<Message>|GuildMember}
   */
  async launch(message, query, options) {
    if (!query.join('') || (message.mentions.members.size < 1 && query[0] !== 'fetch')) {
      return message.channel.send({embed: this.badUsage});
    };
    /**
     * @type {GuildMember}
     */
    let member;
    /**
     * @type {WarnGroup}
     */
    let warns;
    switch (query.shift().trim().toLowerCase()) {
      case 'add':
        message.mentions.members.each(async (member) => {
          if (message.member.roles.highest.position <
            member.roles.highest.position &&
            message.member.id !== message.guild.ownerID) {
            return message.channel.send(
                `❌ | [${
                  member.user.tag
                }] You cannot warn someone with a higher position than you`);
          };
          if (message.guild.me.roles.highest.position <
          member.roles.highest.position) {
            return message.channel.send(
                `❌ | [${
                  member.user.tag
                }] I have lower permissions than the user`);
          };
          const warns = await this.client.getWarn(member, message.guild);
          /**
           * 2147483647 is max 32-bit signed integer timeout supported
           */
          let parsed = false;
          if (options.time && (ms(options.time) > 2147483647)) {
            message.channel.send(`⚠️ | [${member.toString()}] ${ms(ms(options.time))} is to long -> time is defined at ${ms(2147483647)}`);
            options.time = 2147483647-1000;
            parsed = true;
          };
          /**
             * @type {Warn}
             */
          const warn = {
            reason: options.reason || 'No reason specified',
            memberID: member.id,
            warner: message.author.tag,
            warnerID: message.author.id,
            channelID: message.channel.id,
            time: options.time ? parsed ? options.time : ms(options.time) : null,
            now: Date.now(),
          };
          if (!warns) {
            warn.id = 1;
            await this.client.createWarn({
              userID: member.id,
              guildID: message.guild.id,
              totalWarn: 1,
              history: [warn],
              active: [warn],
            }).then(() => {
              if (warn.time) {
                const _tempWarn = {
                  id: warn.id,
                  timeout: setTimeout(async () => {
                    const _warns = await this.client.getWarn(member, message.guild);
                    const index = _warns.active.findIndex((swarn) => swarn.id === warn.id);
                    if (index === -1) return message.channel.send(`❌ | [${member.toString()}] I can't unwarn this user`);
                    _warns.active.splice(index, 1);
                    this.client.updateWarn(member, message.guild, _warns).then(() => {
                      return message.channel.send(`✅ | [${member.toString()}] is now unwarn - ID: ${warn.id}`);
                    }).catch((err) => {
                      return message.channel.send(`❌ | [${member.toString()}] I can't unwarn - ID: ${warn.id}`);
                    });
                    const i = this.client.warn[member.id].findIndex((swarn) => swarn.id === warn.id);
                    this.client.warn[member.id].splice(i, 1);
                    if (this.client.warn[member.id].length < 1) {
                      delete this.client.warn[member.id];
                    };
                  }, warn.time+1000),
                };
                if (!this.client.warn[member.id]) {
                  this.client.warn[member.id] = [_tempWarn];
                } else {
                  this.client.warn[member.id].push(_tempWarn);
                };
              };
              return message.channel.send(
                  `✅ | [${member.toString()}] is warn for **${warn.reason}**${warn.time ? ` while **${ms(warn.time)}**` : ''}`,
              );
            }).catch((err) => {
              return message.channel.send(
                  `❌ | [${member.toString()}] I can't warn this user`);
            });
          } else {
            warns.totalWarn++;
            warn.id = warns.totalWarn,
            warns.history.push(warn);
            warns.active.push(warn);
            this.client.updateWarn(member, message.guild, warns).then(() => {
              if (warn.time) {
                const _tempWarn = {
                  id: warn.id,
                  timeout: setTimeout(async () => {
                    const _warns = await this.client.getWarn(member, message.guild);
                    const index = _warns.active.findIndex((swarn) => swarn.id === warn.id);
                    if (index === -1) return message.channel.send(`❌ | [${member.toString()}] I can't unwarn this user`);
                    _warns.active.splice(index, 1);
                    this.client.updateWarn(member, message.guild, _warns).then(() => {
                      return message.channel.send(`✅ | [${member.toString()}] is now unwarn - ID: ${warn.id}`);
                    }).catch((err) => {
                      return message.channel.send(`❌ | [${member.toString()}] I can't unwarn - ID: ${warn.id}`);
                    });
                    const i = this.client.warn[member.id].findIndex((swarn) => swarn.id === warn.id);
                    this.client.warn[member.id].splice(i, 1);
                    if (this.client.warn[member.id].length < 1) {
                      delete this.client.warn[member.id];
                    };
                  }, warn.time+1000),
                };
                if (!this.client.warn[member.id]) {
                  this.client.warn[member.id] = [_tempWarn];
                } else {
                  this.client.warn[member.id].push(_tempWarn);
                };
              };
              return message.channel.send(
                  `✅ | [${member.toString()}] is warn for **${warn.reason}**${warn.time ? ` while **${ms(warn.time)}**` : ''}`,
              );
            }).catch((err) => {
              return message.channel.send(
                  `❌ | [${member.toString()}] I can't warn this user`);
            });
          };
        });
        break;
      case 'remove':
        member = message.mentions.members.first();
        if (!member && mentions.mentions.members.size < 1) {
          return message.channel.send(`❌ | Please mention a member`);
        };
        if (!member) {
          return message.channel.send(`❌ | I don't found member`);
        };
        // eslint-disable-next-line no-unused-vars
        /**/const d=query.shift();/* delete member arguments */
        if (!query.join('') || query.join('').split('-')[0] === '') {
          return message.channel.send('❌ | Please enter warn ID');
        };
        warns = await this.client.getWarn(member, message.guild);
        const i = warns.active.findIndex((warn) => warn.id === parseInt(query[0]));
        if (i === -1) return message.channel.send(`❌ | [${member.toString()}] I don't find warn with id ${parseInt(query[0])}`);
        warns.active.splice(i, 1);
        this.client.updateWarn(member, message.guild, warns).then(() => {
          /* Search warn */
          if (this.client.warn[member.id]) {
            const _i = this.client.warn[member.id].findIndex((_warn) => _warn.id === parseInt(query[0]));
            if (_i !== -1) {
              this.client.warn[member.id].splice(_i, 1);
              if (this.client.warn[member.id].length < 1) {
                delete this.client.warn[member.id];
              };
            };
          };
          return message.channel.send(`✅ | [${member.toString()}] is now unwarn - ID: ${parseInt(query[0])}`);
        }).catch((err) => {
          /* Search warn */
          if (this.client.warn[member.id]) {
            const _i = this.client.warn[member.id].findIndex((_warn) => _warn.id === parseInt(query[0]));
            if (_i !== -1) {
              this.client.warn[member.id].splice(_i, 1);
              if (this.client.warn[member.id].length < 1) {
                delete this.client.warn[member.id];
              };
            };
          };
          return message.channel.send(`❌ | [${member.toString()}] I can't unwarn - ID: ${parseInt(query[0])}`);
        });
        break;
      case 'fetch':
        const packetWarns = await Warns.find({guildID: message.guild.id});
        /**
         * @type {Warn}
         */
        warns = [];
        packetWarns.map((warn) => warn.history.map((_warn) => warns.push(_warn)));
        if (options.warner) {
          warns = warns.filter((v) => options.warner.match(new RegExp(v.warnerID)) !== null);
        };
        if (options.warnid) {
          warns = warns.filter((v) => v.id === parseInt(options.warnid));
        };
        if (options.userid) {
          warns = warns.filter((v) => v.memberID === options.userid);
        };
        if (options.reason) {
          warns = warns.filter((v) => v.reason.trim().toLowerCase().match(new RegExp(`${options.reason.trim().toLowerCase()}`, 'gi')) !== null);
        };
        message.channel.send({embed: {
          title: `List of warns`,
          color: 'RED',
          fields: warns.slice(0, 25).map((warn) => {
            return {
              name: `${warn.id}   |   By: ${warn.warner}`,
              value: `> **user**: ${message.guild.members.cache.has(warn.memberID) ? message.guild.members.cache.get(warn.memberID).toString() : 'no user found'}\n> **reason**: ${warn.reason}\n> **time**: ${warn.time ? ms(warn.time) : warn.time}\n> **date**: ${moment(warn.now).format('L')}`,
              inline: true,
            };
          }),
        }});
        break;
      case 'history':
        member = message.mentions.members.first();
        if (!member && mentions.mentions.members.size < 1) {
          return message.channel.send(`❌ | Please mention a member`);
        };
        if (!member) {
          return message.channel.send(`❌ | I don't found member`);
        };
        warns = await this.client.getWarn(member, message.guild);
        if (!warns) {
          message.channel.send(
              `❌ | [${member.toString()}] this user has not warn`);
        } else {
          message.channel.send({embed: {
            title: `List of ${member.displayName}'s warn`,
            color: 'RED',
            thumbnail: {
              url: member.user.displayAvatarURL({dynamic: true}),
            },
            fields: warns.history.slice(0, 25).map((warn) => {
              return {
                name: `${warn.id}   |   By: ${warn.warner}`,
                value: `> **reason**: ${warn.reason}\n> **time**: ${warn.time ? ms(warn.time) : warn.time}\n> **date**: ${moment(warn.now).format('L')}`,
                inline: true,
              };
            }),
          }});
        };
        break;
      default:
        member = message.mentions.members.first();
        if (!member && mentions.mentions.members.size < 1) {
          return message.channel.send(`❌ | Please mention a member`);
        };
        if (!member) {
          return message.channel.send(`❌ | I don't found member`);
        };
        warns = await this.client.getWarn(member, message.guild);
        if (!warns) {
          message.channel.send(
              `❌ | [${member.toString()}] this user has not warn`);
        } else {
          message.channel.send({embed: {
            title: `List of ${member.displayName}'s warn`,
            color: 'RED',
            thumbnail: {
              url: member.user.displayAvatarURL({dynamic: true}),
            },
            fields: warns.active.map((warn) => {
              return {
                name: `${warn.id}   |   By: ${warn.warner}`,
                value: `> **reason**: ${warn.reason}\n> **time**: ${warn.time ? ms(warn.time) : warn.time}\n> **date**: ${moment(warn.now).format('L')}`,
                inline: true,
              };
            }),
          }});
        };
        break;
    };
  };
};
