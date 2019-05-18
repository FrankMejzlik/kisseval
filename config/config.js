/*!
 * Script handling global configuration
 */

// Require Lodash module
const moduleLodaSh = require('lodash');

// Get config file
const config = require('./config.json');


// Get ranker config
global.ranker = new Object();
global.ranker = require('./settings_ranker.json');


// Default things are in development
const defaultConfig = config.development;

// Get current env setup
const environment = process.env.NODE_ENV || 'development';

// Create enviroment config
const environmentConfig = config[environment];

// Merge to final config
const finalConfig = moduleLodaSh.merge(defaultConfig, environmentConfig);

// Store final config in globals
global.gConfig = finalConfig;

// Output current config
if (global.gConfig.log_all == true)
{
    console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);
}