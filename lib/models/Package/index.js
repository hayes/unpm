var guard = require('../../utils/guard')
  , get_deps = require('./get_deps')
  , request = require('request')
  , clone = require('./clone')
  , semver = require('semver')
  , path = require('path')

module.exports = setup

function setup(app) {
  var backend = app.backend
    , Package = {}

  Package.get_version_meta = get_version_meta
  Package.get_tarball = backend.get_tarball
  Package.set_tarball = backend.set_tarball
  Package.get_versions = get_versions
  Package.get_meta = backend.get_meta
  Package.set_meta = backend.set_meta
  Package.get_deps = get_deps
  Package.publish = publish
  Package.clone = clone
  Package.app = app
  Package.add = add

  return Package

  function get_versions(name, done) {
    backend.get_meta(name, guard(function(err, meta) {
      if(err || !meta) {
        return done(err)
      }

      done(null, Object.keys(meta.versions))
    }, done))
  }

  function get_version_meta(name, version, done) {
    backend.get_meta(name, guard(function(err, meta) {
      if(err || !meta) {
        return done(err || new Error('Package not found'))
      }

      version = semver.maxSatisfying(Object.keys(meta.versions), version)

      done(null, meta.versions[version])
    }, done))
  }

  function publish(meta, done) {
    var tags = meta['dist-tags']
      , version = tags.latest
      , name = meta.name
      , filename
      , stream

    filename = name + '-' + version + '.tgz'

    try {
      stream = backend.set_tarball(name, version)
      stream.write(new Buffer(meta._attachments[filename].data, 'base64'))
      stream.end()
    } catch(err) {
      done(err)
    }

    delete meta._attachments
    save_meta(name, version, tags, meta.versions[version], done)
  }

  function save_meta(name, version, tags, meta, done) {
    backend.get_meta(name, function(err, module_meta) {
      module_meta = module_meta || {'dist-tags': {}, versions: {}}

      var versions = Object.keys(module_meta.versions)

      module_meta.versions[version] = meta
      versions.push(version)

      versions.sort(semver.lt)
      module_meta['dist-tags'].latest = versions[0]

      Object.keys(tags).forEach(function(tag) {
        if(!module_meta['dist-tags'][tag]) {
          module_meta['dist-tags'][tag] = tags[tag]
        }
      })

      backend.set_meta(name, module_meta, function(err) {
        done(err, err ? null : module_meta)
      })
    })
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
