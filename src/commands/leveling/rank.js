/* eslint-disable */
'use strict';
const Command = require('../../plugin/Command');
const {Canvas} = require('canvas-constructor');
const {loadImage} = require('canvas');
const {MessageAttachment} = require('discord.js');
const imgo = require('imgo');

/**
 * Get algorithme
 * @param {number} messages
 * @param {?number} difficulty
 * @return {object}
 */
function calculatepoint(messages, difficulty = 1.25) {
  const algos = {
    messages,
    difficulty,
  };
  algos.xp = algos.messages/1.25;
  algos.base = 100*algos.difficulty;
  algos.level = Math.ceil(
      (algos.difficulty*algos.xp)/(algos.difficulty*algos.base));
  algos.next = algos.base*algos.level;
  algos.ratio = algos.xp/algos.next;
  return algos;
};
/**
 * Shorten
 * @param {number} number
 * @return {number|null}
 */
function shorten(number) {
  if (isNaN(number) && typeof number !== 'number') return number;
  const count = String(number).length;
  const t = String(number).split('');
  if (count <= 3) return number;
  else if (count > 3 && count <= 6) {
    return `${t.join('').slice(0, t.length-3)}k`;
  } else if (count > 6 && count <= 9) {
    return `${t.join('').slice(0, t.length-6)}M`;
  } else if (count > 9 && count <= 12) {
    return `${t.join('').slice(0, t.length-9)}B`;
  } else return number;
};

/**
 * Command class
 */
module.exports = class Rank extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'rank',
      category: 'leveling',
      description: 'command_rank_description',
      usage: 'rank (global)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      mePerm: ['ATTACH_FILES'],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - query
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @param {Object} options.user - user data
   * @return {Message}
   */
  async launch(message, query, {guild, user, levelingUser, levelingGuild}) {
    const member = message.mentions.members.first() || message.member;
    const userLvl = await this.client.getLevelingUser(member);
    user = await this.client.getUser(member);
    const name = member.displayName.length > 20 ?
      member.displayName.substring(0, 17) + '...' : member.displayName;
    if (query.join('') === 'global') {
        
      const point = calculatepoint(userLvl.messageCount);
      
      const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
      const background = await loadImage(`https://cdn.ohori.me/store/${user.banner.id}.${
        user.banner.extension.includes('png') ?
        user.banner.extension[user.banner.extension.findIndex((e) => e === 'png')] :
        user.banner.extension[user.banner.extension.findIndex((e) => e === 'jpg')]
      }`);
      const buffer = new Canvas(1920, 1080)
          .setColor('#7289DA')	
          .addImage(background, 0, 0, 400, 180, {restore: true})	
          // .addRect(84, 0, 316, 180)	
          .setColor('#2C2F33')	
          // .addRect(169, 26, 231, 46)	
          // .addRect(224, 108, 176, 46)	
          .save()	
          .createBeveledClip(10, 150, 380, 25, 5)	
          .fill()	
          .restore()	
          .setColor('#7289DA')	
          .save()//                   ---------------	
          .createBeveledClip(35, 153, point.ratio*352, 20, 5)	
          .fill()	
          .restore()	
          .setColor('#2C2F33')	
          .setShadowColor('rgba(22, 22, 22, 1)')	
          .setShadowOffsetY(5)	
          .setShadowBlur(10)	
          .addCircle(84, 70, 62)	
          // eslint-disable-next-line max-len	
          .addCircularImage(avatar, 86, 65, 64) 	
          .save()	
          .createBeveledClip(10, 120, 160, 25, 5)	
          .setColor('#23272A')	
          .fill()	
          .restore()	
          .setTextAlign('center')	
          .setTextFont('10pt sans')	
          .setColor('#FFFFFF')
          .addText(`lvl: ${point.level.toLocaleString()} | ${name}`, 90, 138)
          .addText(`xp: ${shorten(point.xp.toLocaleString())}`, 43, 167)
          .setTextAlign('left')	
          // .addText(`Score: ${Math.round(point.xp.toLocaleString())}`, 241, 136)
          .toBuffer();
      const fileName = `globalRank-${message.author.id}.png`;
      const attachment = new MessageAttachment(buffer, fileName);
      message.channel.send({files: [attachment]});
    } else {
      const u = levelingGuild.users
        .findIndex((u) => u.id === member.id);
      const point = calculatepoint(levelingGuild.users[u].messageCount);
      
      const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
      const background = await loadImage(`https://cdn.ohori.me/store/${user.banner.id}.${
        user.banner.extension.includes('png') ?
        user.banner.extension[user.banner.extension.findIndex((e) => e === 'png')] :
        user.banner.extension[user.banner.extension.findIndex((e) => e === 'jpg')]
      }`);
      const buffer = new Canvas(400, 180)
          .setColor('#7289DA')
          .addImage(background, 0, 0, 400, 180, {restore: true})
          // .addRect(84, 0, 316, 180)
          .setColor('#2C2F33')
          // .addRect(169, 26, 231, 46)
          // .addRect(224, 108, 176, 46)
          .save()
          .createBeveledClip(10, 150, 380, 25, 5)
          .fill()
          .restore()
          .setColor('#7289DA')
          .save()//                   ---------------
          .createBeveledClip(35, 153, point.ratio*352, 20, 5)
          .fill()
          .restore()
          .setColor('#2C2F33')
          .setShadowColor('rgba(22, 22, 22, 1)')
          .setShadowOffsetY(5)
          .setShadowBlur(10)
          .addCircle(84, 70, 62)
          // eslint-disable-next-line max-len
          .addCircularImage(avatar, 86, 65, 64) 
          .save()
          .createBeveledClip(10, 120, 160, 25, 5)
          .setColor('#23272A')
          .fill()
          .restore()
          .setTextAlign('center')
          .setTextFont('10pt sans')
          .setColor('#FFFFFF')
          .addText(`lvl: ${point.level.toLocaleString()} | ${name}`, 90, 138)
          .addText(`xp: ${shorten(Number(point.xp.toLocaleString()))}`, 40, 167)
          .setTextAlign('right')
          .setTextFont('12pt sans')
          .addText(`${message.guild.name}`, 375, 20)
          .setTextAlign('left')
          // .addText(`Score: ${Math.round(point.xp.toLocaleString())}`, 241, 136)
          .toBuffer();
      const fileName = `rank-${message.author.id}.png`;
      const attachment = new MessageAttachment(buffer, fileName);
      message.channel.send({files: [attachment]});
    };
  };
};
