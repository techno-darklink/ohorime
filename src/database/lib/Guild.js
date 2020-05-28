'use strict';
const mongoose = require('mongoose');

const guildShema = {
  id: String,
  prefix: String,
  color: String,
  language: {
    'type': String,
    'default': 'en',
  },
  banner: {
    'type': Object,
    'default': {
      id: '001',
      extension: ['webp', 'png'],
    },
  },
  items: {'type': Array, 'default': [
    {id: '001', extension: ['webp', 'png']},
  ]},
  welcome_banner: String,
  welcome_channel: String,
  welvome_active: {
    'type': Boolean,
    'default': false,
  },
  goodbye_banner: String,
  goodbye_channel: String,
  goodbye_active: {
    'type': Boolean,
    'default': false,
  },
  mute_role: String,
  mute_affectVocal: {
    'type': Boolean,
    'default': false,
  },
  mute_channels: Object,
};

module.exports = mongoose.model('Guild', guildShema);
