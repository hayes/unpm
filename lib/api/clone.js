var backend = require('../storage')
  , not_found = require('./404')
  , request = require('request')
  , semver = require('semver')

var a_version = /^[!*~|.\d +<>=()]|latest$/

module.exports = clone

function clone(req, res, name, version) {
  clone_module(name, version, req.query.recursive, function(err, data) {
    if(err) {
      return on_error(req, res)
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
  var url = 'http://registry.npmjs.org/' + name
    , cache_key = name + '@' + version

  if(!done) {
    done = cache
    cache = {}
  } else if(cache[cache_key]) {
    return done(null, cache[cache_key])
  }

  console.log(name, version)

  request(url, function(err, response, body) {
    if(err || +response.statusCode !== 200) {
      return done(err || new Error('unexpected status code: ' + statusCode))
    }

    var versions
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
      meta.dist.tarball = 'http://localhost:8123/registry/' + name
      meta.dist.tarball += '/-/' + name + '-' + version + '.tgz'
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
