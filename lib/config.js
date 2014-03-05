var defaults = require('./config.json')

module.exports = function(config) {
  if(process.env.UNPM_CONFIG) {
    try {
      add(require(process.env.UNPM_CONFIG))
    } catch(e) {
    }
  }

  add(defaults)

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = config[key] || overrides[key]
    })
  }
}
