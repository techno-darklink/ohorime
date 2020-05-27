'use strict';
const mongoose = require('mongoose');

const playerUserShema = {
  id: String,
  musicFavorite: Object,
};

module.exports = mongoose.model('PlayerUser', playerUserShema);
