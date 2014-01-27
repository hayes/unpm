var get_deps = require('./get_deps')
  , backend = require('../storage')
  , config = require('../config')
  , request = require('request')
  , semver = require('semver')
  , path = require('path')
  , url = require('url')

var registry_url = url.format({
    hostname: config.hostname
  , protocol: config.protocol
  , port: config.port
  , pathname: '/registry'
})

// this is hacky and should be fixed
var a_version = /^[!*~|.\d +<>=()]|latest$/

module.exports = clone_module

function clone_module(name, version, recusive, cache, done) {
  var src = url.resolve(config.public_registry, name)
    , cache_key = name + '@' + version

  if(!done) {
    done = cache
    cache = {}
  } else if(cache[cache_key]) {
    return done(null, cache[cache_key])
  }

  request(src, function(err, response, body) {
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
      meta.dist.tarball = registry_url + path.join('/', name, '-', filename)
      cache[cache_key] = meta
    } catch(err) {
      return done(err)
    }

    backend.add(name, version, tags, meta, tarball, function(err) {
      if(err) {
        return done(err)
      }

      if(!recusive) {
        return done(nul, meta)
      }

      get_deps(deps, cache, done)
    })
  })
}
