var Package = require('../../models/Package')
  , responses = require('../../responses')

module.exports = get_deps

function get_deps(req, res, route, respond) {
  var version = route.params.version
    , name = route.params.name

  Package.get_version_meta(name, version || '*', got_meta)

  function got_meta(err, meta) {
    if(err) {
      return respond(err)
    }

    if(!meta) {
      return responses.not_found(req, res)
    }

    Package.get_deps(meta, {}, true, function(err, data) {
      if(err) {
        return respond(err)
      }

      respond(null, 201, Object.keys(data))
    })
  }
}
