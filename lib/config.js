var defaults = require('./config.json')
  , responses = require('./responses')
  , models = require('./models')
  , auth = require('./auth')
  , config = {}
  , env = {}

module.exports = function(config) {
  add(models(config))

  if(process.env.FNPM_CONFIG) {
    add(config, require(process.env.FNPM_CONFIG))
  }

  add(responses)
  add(defaults)

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = config[key] || overrides[key]
    })
  }
}
