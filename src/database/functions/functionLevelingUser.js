const mongoose = require('mongoose');
const {LevelingUser} = require('./../lib');

module.exports = (client) => {
  client.getLevelingUser = async (guild) => {
    const data = await LevelingUser.findOne({id: String(guild.id)});
    if (!data) return null;
    return data;
  };

  client.updateLevelingUser = async (guild, settings) => {
    let data = await client.getLevelingUser(guild);
    if (typeof data !== 'object') data = {};
    for (const key in settings) {
      if (data[key] !== settings[key]) data[key] = settings[key];
    };
    return data.updateOne(settings);
  };

  client.createLevelingUser = async (settings) => {
    // eslint-disable-next-line new-cap
    const merged = Object.assign({_id: mongoose.Types.ObjectId()}, settings);
    const createGuild = await new LevelingUser(merged);
    return await createGuild.save();
  };
};
