var request = require('request')
  , semver = require('semver')
  , path = require('path')
  , url = require('url')

module.exports = clone_module

function clone_module(name, version, recusive, cache, done) {
  var src = url.resolve(this.app.public_registry, name)
    , cache_key = name + '@' + version
    , log = this.app.log
    , self = this

  var package_url = url.format({
      hostname: self.app.hostname
    , protocol: self.app.protocol
    , port: self.app.port
    , pathname: self.app.pathname
  })

  if(!done) {
    done = cache
    cache = {}
  } else if(cache[cache_key]) {
    return done(null, cache[cache_key])
  }

  log.info('cloning', '%s@%s', name, version)
  log.http('GET', src)

  request(src, on_response)

  function on_response(err, response, body) {
    if(err) {
      return done(err)
    }

    log.http(response.statusCode, src)

    if(+response.statusCode !== 200) {
      return done(new Error('unexpected status code: ' + response.statusCode))
    }

    var versions
      , filename
      , tarball
      , meta
      , tags
      , deps

    try {
      meta = JSON.parse(body)
      versions = Object.keys(meta.versions)
      version = semver.maxSatisfying(versions, version || '*', true)
      tags = meta['dist-tags']
      meta = meta.versions[version]
      deps = meta.dependencies
      tarball = meta.dist.tarball
      filename = name + '-' + version + '.tgz'
      meta.dist.tarball = package_url + path.join('/', name, '-', filename)
      cache[cache_key] = meta
    } catch(err) {
      return done(err)
    }

    self.add(name, version, tags, meta, tarball, function(err) {
      if(err) {
        return done(err)
      }

      if(!recusive) {
        return done(null, meta)
      }

      self.get_deps(deps, cache, done)
    })
  }
}
