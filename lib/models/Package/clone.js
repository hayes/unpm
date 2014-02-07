var request = require('request')
  , semver = require('semver')
  , path = require('path')
  , url = require('url')

module.exports = clone_module

function clone_module(name, version, recusive, cache, done) {
  var src = url.resolve(this.config.public_registry, name)
    , cache_key = name + '@' + version
    , self = this

  var package_url = url.format({
      hostname: self.config.hostname
    , protocol: self.config.protocol
    , port: self.config.port
    , pathname: self.config.pathname
  })

  if(!done) {
    done = cache
    cache = {}
  } else if(cache[cache_key]) {
    return done(null, cache[cache_key])
  }

  console.log('cloning:', src)

  request(src, on_response)

  function on_response(err, response, body) {
    if(err || +response.statusCode !== 200) {
      return done(
          err || new Error('unexpected status code: ' + response.statusCode)
      )
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
