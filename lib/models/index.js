module.exports = function setup_models(server) {
  var modules = ['User', 'Package']
    , exports = {}

  exports.models = modules.reduce(function(models, name) {
    models[name] = require('./' + name)(server)

    return models
  }, {})

  return exports
}
