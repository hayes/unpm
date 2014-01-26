var defaults = require('../config.json')
  , overrides = {}
  , config = {}

module.exports = config

if(process.env.PNPM_CONFIG) {
  overrides = require(process.env.FNPM_CONFIG)
}

Object.keys(defaults).forEach(function(key) {
  config[key] = overrides[key] || defaults[key]
})
