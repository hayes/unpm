var request = require('request')
var url = require('url')

module.exports = getPackage

function getPackage(respond, route, unpm) {
  var baseUrl = url.format(unpm.config.host)
  var version = route.params.version
  var name = route.params.name

  if(!version) {
    return unpm.Package.getMeta(name, returnMeta)
  }

  unpm.Package.getVersionMeta(name, version, returnMeta)

  function returnMeta(err, meta) {
    if(err) {
      return respond(err)
    }

    if(!meta) {
      return notFound()
    }

    if(!version) {
      Object.keys(meta.versions).forEach(function(version) {
        meta.versions[version].dist.tarball = getTarballUrl(version)

        if(!meta.versions[version]._id) {
          meta.versions[version]._id = name + '@' + version
        }
      })
    } else {
      meta.dist.tarball = getTarballUrl(version)
    }

    return respond(null, 200, meta)
  }

  function getTarballUrl(version) {
    return baseUrl + '/' + name + '/-/' + name + '/' + version + '.tgz'
  }

  function notFound() {
    if(!unpm.config.fallback) {
      return respond.notFound()
    }

    request(unpm.config.fallback + route.path, proxyResponse)
  }

  function proxyResponse(err, res, data) {
    if(err) {
      return respond(err)
    }

    if(res.statusCode !== 200) {
      respond.res.writeHead(res.statusCode, res.headers)

      return respond.res.end(data)
    }

    try {
      respond(null, 200, JSON.parse(data))
    } catch(err) {
      respond(err)
    }
  }
}
