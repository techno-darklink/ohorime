'use strict';
const mongoose = require('mongoose');

const userShema = {
  id: String,
  items: Array,
  coins: {
    'type': Number,
    'default': 15000,
  },
  upvote: {
    'type': Object,
    'default': {
      count: 0,
      timeout: Date.now() - 21600000,
    },
  },
  daily: {
    'type': Object,
    'default': {
      count: 0,
      timeout: Date.now() - 86400000,
    },
  },
  banner: {
    'type': Object,
    'default': {
      id: '001',
      extension: ['webp', 'png'],
    },
  },
};

module.exports = mongoose.model('User', userShema);
