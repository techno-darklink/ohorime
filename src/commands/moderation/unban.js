'use strict';
const Command = require('../../plugin/Command');

/**
 * Command class
 */
module.exports = class UnBan extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'unban',
      category: 'moderation',
      description: 'command_unban_description',
      usage: ['unban (...id) <-reason>'],
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
    if (!query.join('')) {
      return message.channel.send({embed: this.badUsage});
    };
    query.filter((id) => !isNaN(id)).forEach(async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let serialize = query.join(' ');
      serialize = serialize.split(/-+/g);
      serialize.shift();
      const mapping = [];
      serialize.map((v) =>
        mapping.push([v.split(/ +/g).shift()
            .trim().toLowerCase(), v.split(/ +/g).slice(1).join(' ')]));
      return message.guild.members.unban(id,
          Object.fromEntries(mapping).reason || 'Ohorime unban user :)')
          .then(() => {
            return message.channel
                .send(`✅ | This user has been successfully unbanned`);
          }).catch((e) => {
            message.channel
                .send(`❌ | A problem occurred while trying to unban the user`);
            return message.channel.send(e.stack, {code: 'js'});
          });
    });
  };
};
