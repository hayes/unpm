var defaults = require('./config.json')
  , responses = require('./responses')
  , backend = require('./leveldb')
  , models = require('./models')
  , auth = require('./auth')
  , config = {}
  , env = {}

module.exports = function(overrides) {
  var config = {}
    , env = {}

  add(defaults)
  add(responses)
  config.backend = backend(config.data_path)

  if(process.env.PNPM_CONFIG) {
    env = require(process.env.FNPM_CONFIG)
    add(config, env)
  }

  add(models(config))
  add(overrides)

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = overrides[key] || config[key]
    })
  }
}
