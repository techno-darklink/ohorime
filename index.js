'use strict';
const {ShardingManager} = require('discord.js');
const {DISCORD_TOKEN} = require('./configuration');
const {sep, resolve} = require('path');

const manager = new ShardingManager(resolve(__dirname, `src${sep}bot.js`), {
  token: DISCORD_TOKEN,
  totalShards: 'auto',
  shardList: 'auto',
  mode: 'process',
  respawn: true,
  execArgv: ['--trace-warnings'],
  shardArgs: ['--ansi', '--color'],
});

manager.spawn();

manager.on('shardCreate', (shard) => {
  shard.on('death', (Shardprocess) => {
    console.log(`[shard: ${shard.id}] has been dead`);
  });
  shard.on('disconnect', () => {
    console.log(`[shard: ${shard.id}] has been disconnected`);
  });
  shard.on('ready', () => {
    console.log(`[shard: ${shard.id}] has been ready`);
  });
  shard.on('reconnecting', () => {
    console.log(`[shard: ${shard.id}] try make reconnection`);
  });
  shard.on('spawn', (Shardprocess) => {
    console.log(`[shard: ${shard.id}] has spawn`);
  });
});
