var backend = require('../storage')
  , not_found = require('./404')
  , request = require('request')
  , semver = require('semver')

module.exports = clone

function clone(req, res, name, version) {
  var url = 'http://registry.npmjs.org/' + name

  request(url, function(err, response, body) {
    if(err) {
      return on_error(req, res, err)
    }

    var statusCode = +response.statusCode
      , versions
      , tarball
      , meta
      , tags

    if(statusCode === 404) {
      return not_found(req, res)
    }

    if(statusCode !== 200) {
      return on_error(req, res, new Error(
          'unexpected status code: ' + statusCode
      ))
    }

    try{
      meta = JSON.parse(body)
      versions = Object.keys(meta.versions)
      version = semver.maxSatisfying(versions, version || '*', true)
      tags = meta['dist-tags']
      meta = meta.versions[version]
    } catch(err) {
      return on_error(req, res, err)
    }

    backend.add(name, version, tags, meta, function(err) {
      if(err) {
        return on_error(req, res, err)
      }

      res.writeHead(201, {
          'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(meta))
      res.end()
    })
  })
}

function on_error(req, res, err) {
  process.stderr.write(err.message)
  res.writeHead(500)
  res.write('something went wrong')
  res.end()
}
