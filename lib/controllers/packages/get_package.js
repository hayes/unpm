var Package = require('../../models/Package')
  , responses = require('../../responses')
  , context = require('../../context')
  , semver = require('semver')

module.exports = get_package

function get_package(req, res, route, respond) {
  var version = route.params.version
    , name = route.params.name
    , tried_proxy = false

  get_meta()

  function get_meta() {
    if(!version) {
      return Package.get_meta(name, return_meta)
    }

    return Package.get_version_meta(name, version, return_meta)
  }

  function return_meta(err, meta) {
    if(err) {
      return respond(err)
    }

    if(!meta) {
      if(!tried_proxy && context().config.caching_proxy) {
        return Package.clone(name, version, false, cloned)
      }

      return responses.not_found(req, res)
    }

    return respond(null, 200, meta)
  }

  function cloned(err) {
    if(err) {
      return respond(err)
    }

    tried_proxy = true
    get_meta()
  }
}
