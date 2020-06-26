'use strict';
const language = require('./../i18n');
const base64 = require('./../plugin/base64');
const event = require('./../plugin/Event');

/**
 * Event Message
 */
module.exports = class Message extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'message',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @return {Promise<Message>}
   */
  async launch(message) {
    if (!message) return;
    /**
     * Check message type and author bot
     */
    if (message.author.bot || message.system) return false;
    let guild; let levelingGuild;
    let user; let levelingUser;
    /**
     * Check message has guild
     */
    if (message.guild) {
      /**
       * Get guild
       */
      guild = await this.client.getGuild(message.guild);
      levelingGuild = await this.client.getLevelingGuild(message.guild);
      /**
       * If guild is null or undefined
       */
      if (!guild) {
        /**
         * Save guild data
         */
        guild = await this.client.createGuild({
          name: message.guild.name,
          id: message.guild.id,
          prefix: this.client.config.prefix,
          color: this.client.config.color,
        });
        await this.client.createAuthGuild({
          id: message.guild.id,
          // eslint-disable-next-line max-len
          token: `${base64(message.guild.id)}.${base64(process.pid)}.${base64(Date.now())}`,
        });
      };
      if (!levelingGuild) {
        levelingGuild = await this.client.createLevelingGuild({
          id: message.guild.id,
          messageCount: 0,
          users: [{id: message.author.id, messageCount: 0}],
        });
      };
      /**
     * guild daily activity
     */
      if (!levelingGuild.dailyActivity ||
        levelingGuild.dailyActivity.length === 0) {
        levelingGuild.dailyActivity = [];
        levelingGuild.dailyActivity.push({
          day: new Date().getDate(),
          month: new Date().getMonth()+1,
          year: new Date().getFullYear(),
          messages: 1,
        });
      } else if (new Date(
          levelingGuild.dailyActivity[
              levelingGuild.dailyActivity.length - 1].year,
          levelingGuild.dailyActivity[
              levelingGuild.dailyActivity.length - 1].month,
          levelingGuild.dailyActivity[
              levelingGuild.dailyActivity.length - 1].day,
      ).toString() !== new Date(
          new Date().getFullYear(),
          new Date().getMonth()+1,
          new Date().getDate()).toString()
      ) {
        levelingGuild.dailyActivity.push({
          day: new Date().getDate(),
          month: new Date().getMonth()+1,
          year: new Date().getFullYear(),
          messages: 1,
        });
      } else {
        levelingGuild.dailyActivity[
            levelingGuild.dailyActivity.length - 1].messages++;
      };
      /**
     * Check lenght of dailyActivity
     */
      if (levelingGuild.dailyActivity.length > 124) {
        levelingGuild.dailyActivity = levelingGuild.dailyActivity
            .slice(levelingGuild.dailyActivity.length-124,
                levelingGuild.dailyActivity.length);
      };
      const u = levelingGuild.users
          .findIndex((u) => u.id === message.author.id);
      if (u !== -1) {
        levelingGuild.users[u].messageCount++;
      } else {
        levelingGuild.users.push({
          id: message.author.id,
          messageCount: 1,
        });
      };
      /**
      * Update guild data
      */
      await this.client.updateLevelingGuild(message.guild, {
        messageCount: levelingGuild.messageCount+1,
        dailyActivity: levelingGuild.dailyActivity,
        users: levelingGuild.users,
      });
    };
    /**
     * Get user data
     */
    user = await this.client.getUser(message.author);
    levelingUser = await this.client.getLevelingUser(message.author);
    /**
     * If user is null or undefined
     */
    if (!user) {
      /**
       * Save user data
       */
      user = await this.client.createUser({
        name: message.author.username,
        id: message.author.id,
      });
      await this.client.createAuthUser({
        id: message.author.id,
        // eslint-disable-next-line max-len
        token: `${base64(message.author.id)}.${base64(process.pid)}.${base64(Date.now())}`,
      });
    };

    if (!levelingUser) {
      levelingUser = await this.client.createLevelingUser({
        id: message.author.id,
        // eslint-disable-next-line max-len
        messageCount: 0,
      });
    };
    /**
     * User daily activity
     */
    if (!levelingUser.dailyActivity ||
        levelingUser.dailyActivity.length === 0) {
      levelingUser.dailyActivity = [];
      levelingUser.dailyActivity.push({
        day: new Date().getDate(),
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        messages: 1,
      });
    } else if (new Date(
        levelingUser.dailyActivity[levelingUser.dailyActivity.length - 1].year,
        levelingUser.dailyActivity[levelingUser.dailyActivity.length - 1].month,
        levelingUser.dailyActivity[levelingUser.dailyActivity.length - 1].day,
    ).toString() !== new Date(
        new Date().getFullYear(),
        new Date().getMonth()+1,
        new Date().getDate()).toString()
    ) {
      levelingUser.dailyActivity.push({
        day: new Date().getDate(),
        month: new Date().getMonth()+1,
        year: new Date().getFullYear(),
        messages: 1,
      });
    } else {
      levelingUser.dailyActivity[
          levelingUser.dailyActivity.length - 1].messages++;
    };
    /**
     * Check lenght of dailyActivity
     */
    if (levelingUser.dailyActivity.length > 124) {
      levelingUser.dailyActivity =
        levelingUser.dailyActivity.slice(levelingUser.dailyActivity.length-124,
            levelingUser.dailyActivity.length);
    };
    /**
     * Update user data
     */
    await this.client.updateLevelingUser(message.author, {
      messageCount: levelingUser.messageCount+1,
      dailyActivity: levelingUser.dailyActivity,
    });
    /**
     * If guild is null or undefined
     */
    if (!guild) {
      /**
       * Create fake guild data
       */
      guild = {
        lg: 'en',
        color: this.client.config.color,
      };
    };
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
    } else if (message.content.trim().startsWith(this.client.user.toString())) {
      query = message.content.trim()
          .slice(this.client.user.toString()).trim().split(/ +/g);
      query.shift();
    } else return;
    /**
     * If there is no command in the message
     */
    if (query.length < 1) return;
    const command = query.shift().toLowerCase();
    /**
     * If bot can send message
     */
    if (message.guild &&
      message.guild.ownerID !== message.client.user.id &&
      !message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES', {
        checkAdmin: true,
      })) return;
    /**
     * check if this command exist
     */
    if (!this.client.commands.has(command) &&
      !this.client.aliases.has(command)) return;
    /**
     * Get command
     */
    const cmd = this.client.commands.get(command) ||
      this.client.commands.get(this.client.aliases.get(command));
    /**
     * Check bot permisisons
     */
    if (message.guild &&
       !cmd.bypass &&
        !message.channel.permissionsFor(message.guild.me).has(cmd.conf.mePerm, {
          checkAdmin: true,
        })) {
      return message.reply(language(guild.lg, 'client_missing_permissions')
          .replace('{{map}}', `\`${cmd.conf.mePerm.join('`, `')}\``));
    };
    /**
     * Check user permissions
     */
    if (message.guild &&
      !cmd.bypass &&
      message.guild.ownerID !== message.member.id &&
      !message.channel.permissionsFor(message.member).has(cmd.conf.userPerm, {
        checkAdmin: true,
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
    let guildPlayer; let userPlayer;
    if (cmd.help.category === 'music') {
      guildPlayer = await this.client.getPlayerGuild(message.guild);
      if (!guildPlayer) {
        guildPlayer = await this.client.createPlayerGuild(message.guild);
      };
      // eslint-disable-next-line no-unused-vars
      userPlayer = await this.client.getPlayerUser(message.author);
      if (!userPlayer) {
        userPlayer = await this.client.createPlayerUser(message.author);
      };
    };
    /**
     * Check if command is enable
     */
    if (!cmd.conf.enable && !cmd.bypass &&
        message.author.id !== this.client.appInfo.owner.id) {
      return message.reply(language(guild.lg, 'command_disable'));
    };
    /**
     * Check command is for developer
     */
    if (cmd.help.category === 'developer' &&
        message.author.id !== this.client.appInfo.owner.id) {
      return message.reply(language(guild.lg, 'command_disable'));
    };
    cmd.launch(message, query, {
      user,
      guild,
      guildPlayer,
      userPlayer,
      levelingUser,
      levelingGuild,
    });
  };
};
