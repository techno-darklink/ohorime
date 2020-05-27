const mongoose = require('mongoose');
const {PlayerUser} = require('./../lib');

module.exports = (client) => {
  client.getPlayerUser = async (guild) => {
    const data = await PlayerUser.findOne({id: String(guild.id)});
    if (!data) return null;
    return data;
  };

  client.updatePlayerUser = async (guild, settings) => {
    let data = await client.getPlayerUser(guild);
    if (typeof data !== 'object') data = {};
    for (const key in settings) {
      if (data[key] !== settings[key]) data[key] = settings[key];
    };
    return data.updateOne(settings);
  };

  client.createPlayerUser = async (settings) => {
    // eslint-disable-next-line new-cap
    const merged = Object.assign({_id: mongoose.Types.ObjectId()}, settings);
    const createGuild = await new PlayerUser(merged);
    return await createGuild.save();
  };
};
