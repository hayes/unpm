var backend = require('../storage')
  , not_found = require('./404')
  , request = require('request')
  , semver = require('semver')

var a_version = /^[!*~|.\d ]+<>=()|latest$/

module.exports = clone

function clone(req, res, name, version) {
  clone_module(name, version, req.query.recursive, function(err, data) {
    if(err) {
      return on_error(req, res)
    }

    res.writeHead(201)
    res.write(JSON.stringify(data))
    res.end()
  })
}

function on_error(req, res, err) {
  process.stderr.write(err.message)
  res.writeHead(500)
  res.write('something went wrong')
  res.end()
}

function clone_module(name, version, recusive, done) {
  var url = 'http://registry.npmjs.org/' + name

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
      return on_error(req, res, err)
    }

    backend.add(name, version, tags, meta, tarball, function(err) {
      if(err || !recusive || !deps) {
        return done(err, meta)
      }

      var remaining = deps.length
        , finished

      Object.keys(deps).forEach(function(name) {
        if(!deps[name].match(a_version) && !--remaining) {
          done(null, meta)
        }

        clone_module(name, deps[name], true, function(err) {
          if(err || !--remaining) {
            done(err, meta)
            done = noop
          }
        })
      })
    })
  })
}

function noop() {}
