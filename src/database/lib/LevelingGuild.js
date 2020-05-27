'use strict';
const mongoose = require('mongoose');

const levelingGuildShema = {
  id: String,
  messageCount: {
    'type': Number,
    'default': 0,
  },
  dailyActivity: {
    'type': Array,
    'default': [
      {day: new Date().getDate(), month: new Date().getMonth(),
        year: new Date().getFullYear(), messages: 0},
    ],
  },
};

module.exports = mongoose.model('LevelingGuild', levelingGuildShema);
