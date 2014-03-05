var Package = require('../../models/Package')
  , responses = require('../../responses')
  , semver = require('semver')

module.exports = get_package

function get_package(req, res, route, respond) {
  var version = route.params.version
    , name = route.params.name

  if(!version) {
    return Package.get_meta(name, return_meta)
  }

  return Package.get_version_meta(name, version, return_meta)

  function return_meta(err, meta) {
    if(err) {
      return respond(err)
    }

    if(!meta) {
      return responses.not_found(req, res)
    }

    return respond(null, 200, meta)
  }
}
