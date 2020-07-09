const mongoose = require('mongoose');
const {Warn} = require('./../lib');

module.exports = (client) => {
  client.getWarn = async (user, guild) => {
    const data = await Warn.findOne({userID: String(user.id),
      guildID: String(guild.id)});
    if (!data) return null;
    return data;
  };

  client.updateWarn = async (user, guild, settings) => {
    let data = await client.getWarn(user, guild);
    if (typeof data !== 'object') data = {};
    for (const key in settings) {
      if (data[key] !== settings[key]) data[key] = settings[key];
    };
    return data.updateOne(settings);
  };

  client.createWarn = async (settings) => {
    // eslint-disable-next-line new-cap
    const merged = Object.assign({_id: mongoose.Types.ObjectId()}, settings);
    const createWarn = await new Warn(merged);
    return await createWarn.save();
  };
};
