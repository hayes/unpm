var Package = require('../models/Package')
  , concat = require('concat-stream')
  , request = require('request')
  , url = require('url')

module.exports = get_package

function get_package(context, route, respond) {
  var base_url = url.format(context.config.host)
    , version = route.params.version
    , name = route.params.name

  if(!version) {
    return Package.getMeta(name, return_meta)
  }

  Package.getVersionMeta(name, version, return_meta)

  function return_meta(err, meta) {
    if(err) {
      return respond(err)
    }

    if(!meta) {
      return not_found()
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

  function get_tarball_url(version) {
    return base_url + '/' + name + '/-/' + name + '/' + version + '.tgz'
  }

  function not_found() {
    if(!context.config.fallback) {
      return respond.not_found()
    }

    request(context.config.fallback + context.route.path, proxy_response)
  }

  function proxy_response(err, res, data) {
    if(err) {
      return respond(err)
    }

    if(res.statusCode !== 200) {
      context.res.writeHead(res.statusCode, res.headers)

      return context.res.end(data)
    }

    try {
      respond(null, 200, JSON.parse(data))
    } catch(err) {
      respond(err)
    }
  }
}
