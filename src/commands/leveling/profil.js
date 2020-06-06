/* eslint-disable no-var */
'use strict';
const Command = require('../../plugin/Command');
const {UserFlags} = require('discord.js');
const {Canvas} = require('canvas-constructor');
const {loadImage} = require('canvas');
const {MessageAttachment} = require('discord.js');
const {sep} = require('path');
Canvas.registerFont(process.cwd() +
  `${sep}assets${sep}fonts${sep}Nunito/Nunito-Regular.ttf`, 'Nunito');
Canvas.registerFont(process.cwd() +
`${sep}assets${sep}fonts${sep}Nunito/Nunito-Bold.ttf`, 'Nunito Bold');
/**
 * Shorten
 * @param {number} number
 * @return {number|null}
 */
function shorten(number) {
  if (isNaN(number) || typeof number !== 'number') return null;
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
module.exports = class Profil extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'profil',
      category: 'leveling',
      description: 'command_profil_description',
      usage: 'profil (id)',
      nsfw: false,
      enable: true,
      guildOnly: false,
      aliases: ['profile'],
      mePerm: [],
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
  async launch(message, query, {guild, user, levelingUser}) {
    const member = message.mentions.members.first() || message.member;
    const userlvl = await this.client.getLevelingUser(member);
    user = await this.client.getUser(member);
    const name = member.displayName.length > 20 ?
    member.displayName.substring(0, 17) + '...' : member.displayName;
    const background = await loadImage(`https://cdn.ohori.me/store/${user.banner.id}.${
      user.banner.extension.includes('png') ?
      user.banner.extension[
          user.banner.extension.findIndex((e) => e === 'png')] :
      user.banner.extension[user.banner.extension.findIndex((e) => e === 'jpg')]
    }`);
    const avatar =
      await loadImage(member.user.displayAvatarURL({format: 'jpg'}));
    const coin =
      await loadImage('https://cdn.discordapp.com/emojis/705224959651479603.png?v=1');
    const speech =
      await loadImage('https://cdn.discordapp.com/emojis/716370058737352755.png?v=1');
    const userflags = await member.user.fetchFlags();
    const flags = new UserFlags(userflags.bitfield).serialize();
    const DISCORD_EMPLOYEE =
      await loadImage('https://cdn.discordapp.com/emojis/716392567846993960.png?v=1');
    const DISCORD_PARTNER =
      await loadImage('https://cdn.discordapp.com/emojis/716384346071760967.png?v=1');
    const HYPESQUAD_PARTNER =
      await loadImage('https://cdn.discordapp.com/emojis/716384345652330587.png?v=1');
    const BUGHUNTER_LEVEL_1 =
      await loadImage('https://cdn.discordapp.com/emojis/716384346101252238.png?v=1');
    const HOUSE_BRAVERY =
      await loadImage('https://cdn.discordapp.com/emojis/716384345576833106.png?v=1');
    const HOUSE_BRILLIANCE =
      await loadImage('https://cdn.discordapp.com/emojis/716384345950126090.png?v=1');
    const HOUSE_BALANCE =
      await loadImage('https://cdn.discordapp.com/emojis/716384345765707898.png?v=1');
    const EARLY_SUPPORTER =
      await loadImage('https://cdn.discordapp.com/emojis/716384345958383647.png?v=1');
    const BUGHUNTER_LEVEL_2 =
      await loadImage('https://cdn.discordapp.com/emojis/716384346029686794.png?v=1');
    var main = new Canvas(500, 400)
        .setColor('#2F3136')
        .addRect(0, 0, 500, 500)
        .addImage(background, 0, 0, 500, 180)
        .save()
        .setColor('#7289DA')
        .addRect(0, 150, 500, 30)
        .setColor('#292B2F')
        .addRect(0, 150, 128, 400)
        .addImage(avatar, 0, 100)
        .save()
        .setTextAlign('center')
        .setTextFont('bold 12pt Nunito Bold')
        .setColor('#FFFFFF')
        .addText(name, 200, 170)
        .save();
    let i = -1;
    if (flags.DISCORD_EMPLOYEE) {
      i++;
      var main = main.addImage(DISCORD_EMPLOYEE, 250 + (20*i), 157, 15, 15);
    };
    if (flags.DISCORD_PARTNER) {
      i++;
      var main = main.addImage(DISCORD_PARTNER, 250 + (20*i), 157, 15, 15);
    };
    if (flags.HYPESQUAD_PARTNER) {
      i++;
      var main = main.addImage(HYPESQUAD_PARTNER, 250 + (20*i), 157, 15, 15);
    };
    if (flags.BUGHUNTER_LEVEL_1) {
      i++;
      var main = main.addImage(BUGHUNTER_LEVEL_1, 250 + (20*i), 157, 15, 15);
    };
    if (flags.BUGHUNTER_LEVEL_2) {
      i++;
      var main = main.addImage(BUGHUNTER_LEVEL_2, 250 + (20*i), 157, 15, 15);
    }
    if (flags.HOUSE_BRAVERY) {
      i++;
      var main = main.addImage(HOUSE_BRAVERY, 250 + (20*i), 157, 15, 15);
    };
    if (flags.HOUSE_BRILLIANCE) {
      i++;
      var main = main.addImage(HOUSE_BRILLIANCE, 250 + (20*i), 157, 15, 15);
    };
    if (flags.HOUSE_BALANCE) {
      i++;
      var main = main.addImage(HOUSE_BALANCE, 250 + (20*i), 157, 15, 15);
    };
    if (flags.EARLY_SUPPORTER) {
      i++;
      var main = main.addImage(EARLY_SUPPORTER, 250 + (20*i), 157, 15, 15);
    };
    var main = main
        .setTextFont('bold 16pt Nunito Bold')
        .addText('Badge', 180, 210)
        .addImage(coin, 5, 240, 25, 25, {restore: true})
        .addText(shorten(user.coins),
            66, 260)
        .addImage(speech, 5, 280, 25, 25, {restore: true})
        .addText(shorten(userlvl.messageCount), 66, 300)
        // Badge 1
        .setColor('#23272A')
        .createBeveledClip(160, 230, 40, 40, 140)
        .fill()
        .restore()
        // Badge 2
        .setColor('#23272A')
        .createBeveledClip(210, 230, 40, 40, 140)
        .fill()
        .restore()
        // Badge 3
        .setColor('#23272A')
        .createBeveledClip(260, 230, 40, 40, 140)
        .fill()
        .restore()
        .save()
        .toBuffer();
    const fileName = `profile-${message.author.id}.png`;
    const attachment = new MessageAttachment(main, fileName);
    message.channel.send({files: [attachment]});
  };
};
