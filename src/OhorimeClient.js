'use strict';
const {Client, Collection} = require('discord.js');
const {CONFIG, ANEMY} = require('../configuration');
const {JpopClient, KpopClient} = require('./client');
const coreExchange = new (require('./plugin/CoreExchange'))();
const Anemy = require('node-anemy');

/**
 * Class Akira exents Client
 * @class
 */
module.exports = class OhorimeClient extends Client {
  /**
    * Constructor options https://discord.js.org/#/docs/main/master/typedef/ClientOptions
    * @param {Object} options
    */
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.aliases = new Collection();
    this.config = CONFIG;
    this.mongoose = require('./database/mongoose');
    this.logger = require('./plugin/Logger');
    this.music = {};
    this.jpop = {
      broadcast: null,
      dispatcher: null,
      ws: new JpopClient(),
      data: null,
    };
    this.kpop = {
      broadcast: null,
      dispatcher: null,
      ws: new KpopClient(),
      data: null,
    };
    this.anime = {};
    this.coreExchange = coreExchange;
    this.anemy = new Anemy.Client({
      token: ANEMY.TOKEN,
    });
  };
  /**
    * Load events file
    * @param {String} eventPath - path to event
    */
  loadEvent(eventPath) {
    try {
      const RequireEvent = require(`./events/${eventPath}`);
      const event = new RequireEvent(this);
      this.on(event.help.name, (...args) => event.launch(...args));
      this.logger.log(`${event.help.name} loaded !`);
    } catch (error) {
      this.logger.error(eventPath);
      console.error(error);
    };
  };
  /**
     * Load commands file
     * @param {String} commandPath - path to command
     */
  loadCommand(commandPath) {
    try {
      const RequireCommand = require(commandPath);
      const command = new RequireCommand(this);
      command.conf.filename = commandPath;
      this.commands.set(command.help.name, command);
      command.conf.aliases.forEach((alias) => {
        this.aliases.set(alias, command.help.name);
      });
      this.logger.log(`${command.help.name} loaded !`);
    } catch (error) {
      console.error(error);
    };
  };
};
