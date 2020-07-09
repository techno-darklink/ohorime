'use strict';
const mongoose = require('mongoose');

const warnShema = {
  userID: String,
  guildID: String,
  totalWarn: {
    type: Number,
    default: 0,
  },
  history: Array,
  active: Array,
};

module.exports = mongoose.model('Warn', warnShema);
