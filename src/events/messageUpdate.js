'use strict';
const language = require('./../i18n');
const event = require('./../plugin/Event');

/**
 * Event MessageUpdate
 */
module.exports = class MessageUpdate extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'messageUpdate',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
   * @param {Message} oldMessage - old message
   * @param {Message} newMessage - new message
   * @return {?Promise<Message>}
   */
  async launch(oldMessage, newMessage) {
    if (!oldMessage && !newMessage) return;
    const message = newMessage;
    /**
     * Check type message, if author is a bot, message edited
     */
    if (!message.author || message.author.bot || message.system ||
        message.edits.length > 2) return false;
    let guild;
    /**
     * Check if guild is in message
     */
    if (message.guild) {
      /**
       * Get guild data
       */
      guild = await this.client.getGuild(message.guild);
    };
    /**
     * Get user data
     */
    const user = await this.client.getUser(message.author);
    /**
     * Set mutli prefix
     */
    let query;
    if (message.content.toLowerCase()
        .startsWith(guild.prefix.toLowerCase())) {
      query = message.content
          .slice(guild.prefix.length).trim().split(/ +/g);
    } else if (message.content.trim().toLowerCase()
        .startsWith(this.client.user.username.trim().toLowerCase())) {
      query = message.content
          .slice(this.client.user.username.length).trim().split(/ +/g);
    } else if (message.content.trim().startsWith(`<@${this.client.id}>`)) {
      query = message.content.trim()
          .slice(this.client.id + 3).trim().split(/ +/g);
      query.shift();
    } else return;
    const command = query.shift().toLowerCase();
    /**
     * If bot can send message
     */
    if (message.guild && !message.guild.me.hasPermission(['SEND_MESSAGES'], {
      checkAdmin: true,
      checkOwner: true,
    })) return;
    /**
     * Create fake guild data
     */
    if (!guild) {
      guild = {
        lg: 'en',
        color: this.client.client.config.color,
      };
    };
    /**
     * check if this command exist
     */
    if (!this.client.commands.has(command) &&
      !this.client.aliases.has(command)) {
      return message.reply(language(guild.lg, 'command_not_found'));
    };
    /**
     * Get command
     */
    const cmd = this.client.commands.get(command) ||
      this.client.commands.get(this.client.aliases.get(command));
    /**
     * Ignore music et modération command
     */
    if (['music', 'moderation'].includes(cmd.help.category)) return;
    /**
     * Check bot permisisons
     */
    if (message.guild &&
       !cmd.bypass &&
       !message.guild.me.hasPermission(cmd.conf.mePerm, {
         checkAdmin: true,
         checkOwner: true,
       })) {
      return message.reply(language(guild.lg, 'client_missing_permissions')
          .replace('{{map}}', `\`${cmd.conf.mePerm.join('`, `')}\``));
    };
    /**
     * Check user permissions
     */
    if (message.guild &&
      !cmd.bypass &&
      !message.member.hasPermission(cmd.conf.userPerm, {
        checkAdmin: true,
        checkOwner: true,
      })) {
      return message.reply(language(guild.lg, 'member_missing_permission'));
    };
    /**
     * Check if channel is nsfw
     */
    if (cmd.conf.nsfw &&
      !cmd.bypass &&
      message.guild &&
      !message.channel.nsfw) {
      return message.reply(language(guild.lg, 'command_nsfw_not_authorized'));
    };
    /**
     * Check if channel is in guild
     */
    if (cmd.conf.guildOnly &&
      !cmd.bypass &&
      !message.guild) {
      return message.reply(language(guild.lg, 'command_dm_not_authorized'));
    };
    /**
     * Check if command is enable
     */
    if (!cmd.conf.enable && !cmd.bypass) {
      return message.reply(language(guild.lg, 'command_disable'));
    };
    /** Execute command */
    cmd.launch(message, query, {user, guild});
  };
};
