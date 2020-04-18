/*!
 * Script handling global configuration
 */

// Require Lodash module
const moduleLodaSh = require('lodash');

// Get config file
const config = require('./config.json');

// Default things are in development
const defaultConfig = config.development;

// Get current env setup
const environment = process.env.NODE_ENV || 'development';

// Create enviroment config
const environmentConfig = config[environment];

// Merge to final config
let finalConfig = moduleLodaSh.merge(defaultConfig, environmentConfig);
const cred = require('./credentials.json');

// Load correct DB credentials
finalConfig.db = cred.db[finalConfig.database]; 

// Login & auth credentials
finalConfig.authUsername = cred.authUsername; 
finalConfig.authPass = cred.authPass; 

// Store final config in globals
global.gConfig = finalConfig;
