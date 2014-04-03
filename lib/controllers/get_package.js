var Package = require('../models/Package')
  , url = require('url')

module.exports = get_package

function get_package(context, route, respond) {
  var base_url = url.format(context.config.host)
    , version = route.params.version
    , name = route.params.name

  var return_meta = make_return_meta(version)

  if(!version) {
    return Package.get_meta(name, return_meta)
  }

  Package.get_version_meta(name, version, return_meta)

  function make_return_meta(version) {
    return return_meta

    function return_meta(err, meta) {
      if(err) {
        return respond(err)
      }

      if(!meta) {
        return respond.not_found()
      }

      if(!version) {
        Object.keys(meta.versions).forEach(function(version) {
          meta.versions[version].dist.tarball = get_tarball_url(version)
        })
      } else {
        meta.dist.tarball = get_tarball_url(version)
      }

      return respond(null, 200, meta)
    }
  }

  function get_tarball_url(version) {
    return base_url + '/' + name + '/-/' + name + '-' + version + '.tgz'
  }

}
