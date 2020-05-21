

// Require Lodash module
const moduleLodaSh = require("lodash");

// Get config file
const config = require("./config.json");

exports.initConfig = function() {
  // Default things are in development
  const defaultConfig = config.development;

  // Get current env setup
  const environment = process.env.NODE_ENV || "development";

  // Create enviroment config
  const environmentConfig = config[environment];

  // Merge to final config
  const finalConfig = moduleLodaSh.merge(defaultConfig, environmentConfig);
  const cred = require("./credentials.json");

  // Login & auth credentials
  finalConfig.devPass = cred.devPass;
  finalConfig.authUsername = cred.authUsername;
  finalConfig.authPass = cred.authPass;

  // Store final config in globals
  global.gConfig = finalConfig;
};
