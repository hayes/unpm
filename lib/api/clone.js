var backend = require('../storage')
  , config = require('../config')
  , not_found = require('./404')
  , request = require('request')
  , semver = require('semver')
  , path = require('path')
  , url = require('url')

var registru_url = url.format({
    hostname: config.hostname
  , protocol: config.protocol
  , port: config.port
  , pathname: '/registry'
})

console.log(registru_url)

var a_version = /^[!*~|.\d +<>=()]|latest$/

module.exports = clone

function clone(req, res, name, version) {
  clone_module(name, version, req.query.recursive, function(err, data) {
    if(err) {
      return on_error(req, res, err)
    }

    res.writeHead(201)
    res.write(JSON.stringify(Object.keys(data)))
    res.end()
  })
}

function on_error(req, res, err) {
  process.stderr.write(err.message)
  res.writeHead(500)
  res.write('something went wrong')
  res.end()
}

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
      meta.dist.tarball = registru_url + path.join('/', name, '-', filename)
    } catch(err) {
      return done(err)
    }

    backend.add(name, version, tags, meta, tarball, function(err) {
      if(err || !recusive || !deps || !Object.keys(deps).length) {
        return done(err, cache)
      }

      var remaining = Object.keys(deps)

      cache[cache_key] = meta

      // apparently requesting all deps simultainiously
      // results in too many open requests :(
      get_dep(remaining.pop())

      function get_dep(name) {
        if(!deps[name].match(a_version)) {
          if(!remaining.length) {
            return done(null, cache)
          }

          return get_dep(remaining.pop())
        }

        clone_module(name, deps[name], true, cache, function(err) {
          if(err) {
            return done(err)
          }

          if(!remaining.length) {
            return done(null, cache)
          }

          get_dep(remaining.pop())
        })
      }
    })
  })
}

function noop() {}
