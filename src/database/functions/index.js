'use strict';

module.exports = (client) => {
  require('./functionUser')(client);
  require('./functionGuild')(client);
  require('./functionAuthUser')(client);
  require('./functionAuthGuild')(client);
  require('./functionLevelingUser')(client);
  require('./functionLevelingGuild')(client);
  require('./functionPlayerUser')(client);
  require('./functionPlayerGuild')(client);
  require('./functionWarn')(client);
};
