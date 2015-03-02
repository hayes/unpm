var request = require('request')
var url = require('url')
var qs = require('querystring')

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
        meta.versions[version].dist = meta.versions[version].dist || {}
        meta.versions[version].dist.tarball = getTarballUrl(version)

        if(!meta.versions[version]._id) {
          meta.versions[version]._id = name + '@' + version
        }
      })
    } else {
      meta.dist.tarball = getTarballUrl(version)
    }

    if(unpm.config.fallback && unpm.config.alwaysIncludeFallback) {
      return addFallback(meta, respond)
    }

    return respond(null, 200, meta)
  }

  function getTarballUrl(version) {
    var escapedName = name.replace('/', '%2f')
    return baseUrl + '/' + escapedName + '/-/' + escapedName + '/' + version + '.tgz'
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

  function addFallback(meta) {
    request(unpm.config.fallback + route.path, function onResponse(err, res, data) {
      var versions
      if(err || res.statusCode !== 200) {
        return respond(null, 200, meta)
      }

      try {
        versions = JSON.parse(data).versions
      } catch(err) {
        return respond(null, 200, meta)
      }

      var keys = Object.keys(meta.versions)

      for(var i = 0, l = keys.length; i < l; ++i) {
        versions[keys[i]] = meta.versions[keys[i]]
      }

      meta.versions = versions
      respond(null, 200, meta)
    })
  }
}
