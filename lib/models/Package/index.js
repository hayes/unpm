var guard = require('../../utils/guard')
  , get_deps = require('./get_deps')
  , request = require('request')
  , clone = require('./clone')
  , path = require('path')

module.exports = setup

function setup(app) {
  var backend = app.backend
    , Package = {}

  Package.set_module_meta = backend.set_module_meta
  Package.get_module_meta = backend.get_module_meta
  Package.get_tarball = backend.get_tarball
  Package.set_tarball = backend.set_tarball
  Package.get_meta = backend.get_meta
  Package.set_meta = backend.set_meta
  Package.get_versions = get_versions
  Package.get_deps = get_deps
  Package.clone = clone
  Package.publish = publish
  Package.app = app
  Package.add = add

  return Package

  function get_versions(name, done) {
    backend.get_module_meta(name, guard(function(err, meta) {
      if(err || !meta) {
        return done(err)
      }

      done(null, meta.versions)
    }, done))
  }

  function publish(name, version, tags, meta, tarball, done) {
    var stream

    try {
      stream = backend.set_tarball(name, version)
      stream.write(new Buffer(tarball, 'base64'))
      stream.end()
    } catch(err) {
      done(err)
    }

    save_meta(name, version, tags, meta, done)
  }

  function save_meta(name, version, tags, meta, done) {
    get_versions(name, function(err, versions) {
      var module_meta = {}

      versions = versions || []

      if(versions.indexOf(version) === -1) {
        versions.push(version)
      }

      Object.keys(tags).forEach(function(tag) {
        if(versions.indexOf(tags[tag]) === -1) {
          delete tags[tag]
        }
      })

      if(!tags.latest) {
        tags.latest = versions.sort()[versions.length - 1]
      }

      module_meta.versions = versions
      module_meta.tags = tags
      backend.set_module_meta(name, module_meta, save_package_meta)
    })

    function save_package_meta(err) {
      if(err) {
        return done(err)
      }

      backend.set_meta(name, version, meta, done)
    }
  }

  function add(name, version, tags, meta, tarball, done) {
    var tar_dir = path.join(app.data_path, 'files', name)
      , req

    try {
      req = request(tarball)
      req.pipe(backend.set_tarball(name, version))
      req.on('error', function(err) {
        done(err)
      })
      req.on('end', function() {
        save_meta(name, version, tags, meta, done)
      })
    } catch(err) {
      done(err)
    }
  }
}
