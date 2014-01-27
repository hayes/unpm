var get_deps = require('../utils/get_deps')
  , backend = require('../storage')
  , on_error = require('./500')
  , conflict = require('./409')

module.exports = publish

function publish(req, res, name) {
  var data = []

  req.on('data', function(d) {
    data.push(d)
  }).on('err', function(err) {
    on_error(req, res, err)
  }).on('end', function() {
    guard(get_versions)(Buffer.concat(data).toString())
  })

  function get_versions(data) {
    var meta = JSON.parse(data)
      , name = meta.name
      , latest

    latest = meta['dist-tags'].latest
    backend.get_versions(name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return conflict(req, res)
      }

      guard(save)(name, latest, meta, respond)
    })
  }

  function respond(err, data) {
    if(err) {
      return on_error(req, res, err)
    }

    res.writeHead(201, {
        'Content-Type': 'application/json'
    })
    res.write(JSON.stringify(Object.keys(data)))
    res.end()
  }

  function guard(fn) {
    return function() {
      try {
        fn.apply(null, arguments)
      } catch(err) {
        on_error(req, res, err)
      }
    }
  }
}

function save(name, version, meta, done) {
  var filename = name + '-' + version + '.tgz'
    , package_meta = meta.versions[version]
    , cache_key = name + '@' + version
    , deps = meta.dependencies
    , cache = {}

  cache[cache_key] = meta
  backend.publish(
      name
    , version
    , package_meta
    , meta['dist-tags']
    , meta._attachments[filename].data
    , on_published
  )

  function on_published(err) {
    if(err) {
      return done(err)
    }

    get_deps(deps, cache, function(err) {
      done(err, package_meta)
    })
  }
}
