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


// Add ranker config to it
finalConfig.ranker = new Object();
finalConfig.ranker = require('./settings_ranker.json');

const cred = require('./credentials.json');

// Load correct DB credentials
finalConfig.db = cred.db[finalConfig.dbIndex]; 


// Store final config in globals
global.gConfig = finalConfig;

// Output current config
if (global.gConfig.log_all == true)
{
    console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);
}