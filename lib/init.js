var defaults = require('./config.json')
  , responses = require('./responses')
  , models = require('./models')
  , npmlog = require('npmlog')
  , auth = require('./auth')
  , config = {}
  , env = {}

module.exports = function(config) {
  add(models(config))

  if(process.env.FNPM_CONFIG) {
    try {
      add(require(process.env.FNPM_CONFIG))
    } catch(e) {
    }
  }

  if(!config.log) {
    config.log = npmlog
  }

  add(responses(config))
  add(defaults)

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = config[key] || overrides[key]
    })
  }
}
