var semver = require('semver')

module.exports = get_package

function get_package(app) {
  return get

  function get(req, res, params) {
    var version = params.$2
      , name = params.$1

    var not_found = app.responses.not_found
      , on_error = app.responses.error
      , Package = app.models.Package
      , ok = app.responses.ok

    if(!version) {
      return Package.get_meta(name, return_meta)
    }

    return Package.get_version_meta(name, version, return_meta)

    function return_meta(err, meta) {
      if(err) {
        return on_error(req, res, err)
      }

      if(!meta) {
        return not_found(req, res)
      }

      return ok(req, res, meta)
    }
  }
}
