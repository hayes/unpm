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
      unpm.log.error({
        action: 'get-meta',
        name: name,
        version: version,
        err: err
      })

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
    var fallback = unpm.config.fallback

    if(!fallback) {
      return respond.notFound()
    }

    if(fallback[fallback.length - 1] === '/') fallback = fallback.slice(0, -1)

    request({
      uri: fallback + route.path,
      gzip: true
    }, proxyResponse)
  }

  function proxyResponse(err, res, data) {
    if(err) {
      unpm.log.error({action: 'proxy-fallback', err: err, name: name})

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
    request({
      uri: unpm.config.fallback + route.path,
      gzip: true
    }, function onResponse(err, res, data) {
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
