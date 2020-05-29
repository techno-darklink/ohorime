'use strict';
const event = require('./../plugin/Event');
/**
 * Event Ready
 */
module.exports = class Ready extends event {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'ready',
      enable: true,
      filename: __filename,
    });
    this.client = client;
  };
  /**
   * Launch script
   */
  async launch() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    /**
     * Indicator log
     */
    this.client.logger.log(`${this.client.user.username} is ready !`);
    /**
     * Fetch application
     */
    this.client.appInfo = await this.client.fetchApplication();
    /**
     * Update application all hours
     */
    setInterval(async () => {
      this.client.appInfo = await this.client.fetchApplication();
    }, 60000);
    // eslint-disable-next-line no-unused-vars
    let broadcastFollow = 0;
    /**
     * Create jpop broadcast
     */
    this.client.jpop.broadcast = this.client.voice.createBroadcast();
    /**
     * Create jpop dispatcher
     */
    this.client.jpop.dispatcher = this.client.jpop.broadcast.play('https://listen.moe/stream');
    /**
     * Events jpop broadcast and subscriber counter
     */
    this.client.jpop.broadcast.on('subscribe', (dispatcher) => {
      console.log('New broadcast subscriber!');
      const guild = dispatcher.player.voiceConnection.channel.guild;
      this.client.music[guild.id].broadcast = true;
      broadcastFollow++;
    });
    this.client.jpop.broadcast.on('unsubscribe', (dispatcher) => {
      console.log('Channel unsubscribed from broadcast :(');
      const guild = dispatcher.player.voiceConnection.channel.guild;
      this.client.music[guild.id].broadcast = false;
      broadcastFollow--;
    });
    /**
     * Create kpop broadcast
     */
    this.client.kpop.broadcast = this.client.voice.createBroadcast();
    /**
     * Create kpop dispatcher
     */
    this.client.kpop.dispatcher = this.client.kpop.broadcast.play('https://listen.moe/kpop/stream');
    /**
     * Events kpop broadcast and subscriber counter
     */
    this.client.kpop.broadcast.on('subscribe', (dispatcher) => {
      console.log('New broadcast subscriber!');
      const guild = dispatcher.player.voiceConnection.channel.guild;
      this.client.music[guild.id].broadcast = true;
      broadcastFollow++;
    });
    this.client.kpop.broadcast.on('unsubscribe', (dispatcher) => {
      console.log('Channel unsubscribed from broadcast :(');
      const guild = dispatcher.player.voiceConnection.channel.guild;
      this.client.music[guild.id].broadcast = false;
      broadcastFollow--;
    });
    /**
     * Set presence
     */
    this.client.user.setPresence({
      activity: {
        name: `a!help | https://ohori.me`,
        type: 'WATCHING',
        application: {
          id: '704867756595478549',
        },
      },
      status: 'dnd',
      afk: false,
    });
    const timeout = setInterval(async () => {
      if (!(await this.client.fetchInitializer).some((v) => v)) {
        this.client.initializer = true;
        require('../web/server')(this.client);
        require('../web/websocket')(this.client);
        clearInterval(timeout);
      };
    }, 10000);

    if (!(await this.client.fetchInitializer).some((v) => v)) {
      this.client.initializer = true;
      require('../web/server')(this.client);
      require('../web/websocket')(this.client);
      clearInterval(timeout);
    };
  };
};
