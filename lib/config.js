var defaults = require('./config.json')

module.exports = function(config) {
  add(defaults)

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = config[key] || overrides[key]
    })
  }
}
