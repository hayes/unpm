var request = require('request')
  , semver = require('semver')
  , path = require('path')
  , url = require('url')

var unpm = CLS.getNamespace('unpm')

module.exports = clone_module

function clone_module(name, version, recusive, cache, done) {
  var config = unpm.get('config')

  var src = url.resolve(config.public_registry, name)
    , log = unpm.get('log')
    , self = this

  var package_url = url.format({
      hostname: config.host.hostname
    , protocol: config.host.protocol
    , port: config.host.port
    , pathname: config.host.pathname
  })

  if(!done) {
    done = cache
    cache = {}
  }

  var cached = cache[name] && semver.maxSatisfying(
      Object.keys(cache[name])
    , version
  )

  if(cached) {
    return done(null, cache[name][cached])
  }

  self.get_version_meta(name, version, function(err, meta) {
    if(meta) {
      cache[name] = cache[name] || {}
      cache[name][meta['dist-tags'].latest] = meta

      return done(null, meta)
    }

    log.info('cloning', '%s@%s', name, version)
    log.http('GET', src)
    request(src, on_response)
  })

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

      if(!meta.versions[version]) {
        // seems like some old versions don't exist anymore
        return done()
      }

      meta = meta.versions[version]
      tarball = meta.dist.tarball
      filename = name + '-' + version + '.tgz'
      meta.dist.tarball = package_url + path.join('/', name, '-', filename)
      cache[name] = cache[name] || {}
      cache[name][meta.version] = meta
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

      self.get_deps(meta, cache, done)
    })
  }
}
