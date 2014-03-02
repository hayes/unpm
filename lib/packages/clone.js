var parse = require('url').parse

module.exports = clone

function clone(app) {

  return clone_package

  function clone_package(req, res, params) {
    var version = params.$2
      , name = params.$1

    var Package = app.models.Package

    var recursive = parse(req.url, true).query.recursive

    Package.clone(name, version, recursive, function(err, data) {
      if(err) {
        return app.responses.error(req, res, err)
      }

      app.responses.created(req, res, Object.keys(data))
    })
  }
}

function noop() {}
