var path = require('path')
var fs = require('fs')

module.exports = function(config) {
  if(config.configfile) {
    add(JSON.parse(fs.readFileSync(path.join(config.configfile))))
  }

  add(JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'))))

  return config

  function add(overrides) {
    Object.keys(overrides).forEach(function(key) {
      config[key] = config[key] === undefined ? overrides[key] : config[key]
    })
  }
}
