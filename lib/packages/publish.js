module.exports = publish

function publish(app, req, res, name) {
  var conflict = app.responses.conflict
    , created = app.responses.created
    , on_error = app.responses.error
    , Package = app.models.Package

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
    Package.get_versions(name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return conflict(req, res)
      }

      guard(save)(name, latest, meta, guard(respond))
    })
  }

  function respond(err, data) {
    if(err) {
      return on_error(req, res, err)
    }

    created(req, res, Object.keys(data))
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

  function save(name, version, meta, done) {
    var filename = name + '-' + version + '.tgz'
      , package_meta = meta.versions[version]
      , cache_key = name + '@' + version
      , deps = package_meta.dependencies
      , cache = {}

    cache[cache_key] = meta
    Package.publish(
        name
      , version
      , meta['dist-tags']
      , package_meta
      , meta._attachments[filename].data
      , on_published
    )

    function on_published(err) {
      if(err) {
        return done(err)
      }

      Package.get_deps(deps, cache, function(err) {
        done(err, package_meta)
      })
    }
  }
}
