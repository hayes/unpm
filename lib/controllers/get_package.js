var Package = require('../models/Package')
  , path = require('path')
  , url = require('url')

module.exports = get_package

function get_package(context, route, respond) {
  var version = route.params.version
    , name = route.params.name

  if(!version) {
    return Package.get_meta(name, return_meta)
  }

  Package.get_version_meta(name, version, return_meta)

  function return_meta(err, meta) {
    var base_url = url.format(context.host)

    if(err) {
      return respond(err)
    }

    if(!meta) {
      return respond.not_found()
    }

    Object.keys(meta.versions).forEach(function(version) {
      meta.versions[version].dist.tarball = path.join(
          base_url
        , name
        , '-'
        , name + '-' + version + '.tgz'
      )
    })

    return respond(null, 200, meta)
  }
}
