var path = require('path')
  , fs = require('fs')

module.exports = function(config) {
  add(JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'))))

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = config[key] === undefined ? overrides[key] : config[key]
    })
  }
}
