const mongoose = require('mongoose');
const {LevelingGuild} = require('./../lib');

module.exports = (client) => {
  client.getLevelingGuild = async (guild) => {
    const data = await LevelingGuild.findOne({id: String(guild.id)});
    if (!data) return null;
    return data;
  };

  client.updateLevelingGuild = async (guild, settings) => {
    let data = await client.getLevelingGuild(guild);
    if (typeof data !== 'object') data = {};
    // eslint-disable-next-line guard-for-in
    for (const key in settings) {
      if (data[key] !== settings[key]) data[key] = settings[key];
      if (key === 'messageCount') {
        const allguild = await LevelingGuild.find();
        const result = allguild.map((guild) => guild.messageCount);
        const reducer = (accumulator, currentValue) =>
          accumulator + currentValue;
        client.coreExchange.emit('messageCount', result.reduce(reducer));
      };
    };
    return data.updateOne(settings);
  };

  client.createLevelingGuild = async (settings) => {
    // eslint-disable-next-line new-cap
    const merged = Object.assign({_id: mongoose.Types.ObjectId()}, settings);
    const createGuild = await new LevelingGuild(merged);
    return await createGuild.save();
  };
};
