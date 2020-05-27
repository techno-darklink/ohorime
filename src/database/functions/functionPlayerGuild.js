const mongoose = require('mongoose');
const {PlayerGuild} = require('./../lib');

module.exports = (client) => {
  client.getPlayerGuild = async (guild) => {
    const data = await PlayerGuild.findOne({id: String(guild.id)});
    if (!data) return null;
    return data;
  };

  client.updatePlayerGuild = async (guild, settings) => {
    let data = await client.getPlayerGuild(guild);
    if (typeof data !== 'object') data = {};
    for (const key in settings) {
      if (data[key] !== settings[key]) data[key] = settings[key];
    };
    return data.updateOne(settings);
  };

  client.createPlayerGuild = async (settings) => {
    // eslint-disable-next-line new-cap
    const merged = Object.assign({_id: mongoose.Types.ObjectId()}, settings);
    const createGuild = await new PlayerGuild(merged);
    return await createGuild.save();
  };
};
