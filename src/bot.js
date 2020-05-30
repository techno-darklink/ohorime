'use strict';
const {readdirSync} = require('fs');
const {DISCORD_TOKEN, CONFIG} = require('./../configuration');
const klaw = require('klaw');
const OhorimeClient = require('./OhorimeClient');
const {parse, sep, resolve} = require('path');

/**
 * @type {OhorimeClient}
 */
const client = new OhorimeClient({
  http: {
    api: 'https://discord.com/api',
    cdn: 'https://cdn.discordapp.com',
  },
  fetchAllMembers: true,
  ws: {
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_EMOJIS',
      'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'GUILD_MESSAGES',
      'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'],
  },
  partials: ['MESSAGE', 'REACTION'],
  presence: {
    activity: {
      name: `${CONFIG.prefix}help | https://ohori.me`,
      type: 'WATCHING',
      application: {
        id: '704867756595478549',
      },
    },
    status: 'dnd',
    afk: false,
  },
});
require('./database/functions')(client);

/**
 * @type {Array<string>}
 */
const eventFiles = readdirSync('./src/events/');

for (const file of eventFiles) {
  client.loadEvent(file);
};

klaw(resolve(__dirname, 'commands')).on('data', (item) => {
  const cmdFile = parse(item.path);
  if (!cmdFile.ext || cmdFile.ext !== '.js') return;
  client.loadCommand(
      `${cmdFile.dir}${sep}${cmdFile.name}${cmdFile.ext}`,
  );
});

client.mongoose.init();
client.login(DISCORD_TOKEN).catch(client.logger.error);

client.jpop.ws.connect();
client.jpop.ws.on('event', (data) => client.jpop.data = data);
client.jpop.ws.on('open', () => console.log('Jpop broadcast connected'));
client.jpop.ws.on('close', () => console.log('Jpop broadcast disconnected'));

client.kpop.ws.connect();
client.kpop.ws.on('event', (data) => client.kpop.data = data);
client.kpop.ws.on('open', () => console.log('Kpop broadcast connected'));
client.kpop.ws.on('close', () => console.log('Kpop broadcast disconnected'));

client.on('error', client.logger.error);

process.on('uncaughtException', (error) => {
  console.warn(error);
  if (!client) return;
  client.errorHook.send(error, {code: 'js'});
});
process.on('unhandledRejection', (listener) => {
  console.warn(listener);
  if (!client) return;
  client.errorHook.send(listener, {code: 'js'});
});
process.on('rejectionHandled', (listener) => {
  console.warn(listener);
  if (!client) return;
  client.errorHook.send(listener, {code: 'js'});
});
process.on('warning', (warning) => {
  console.warn(warning);
  if (!client) return;
  client.errorHook.send(warning, {code: 'js'});
});
