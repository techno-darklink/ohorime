'use strict';
const mongoose = require('mongoose');

const playerGuildShema = {
  id: String,
  player_history: Array,
  player_volume: {
    'type': Number,
    'default': 50,
  },
  player_loop: {
    'type': String,
    'default': 'off',
  },
  player_muteIndicator: {
    'type': Boolean,
    'default': false,
  },
};

module.exports = mongoose.model('PlayerGuild', playerGuildShema);
