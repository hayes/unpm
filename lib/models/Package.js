var guard = require('../utils/guard')
  , context = require('../context')
  , request = require('request')
  , semver = require('semver')
  , path = require('path')
  , Package = {}

module.exports = Package

Package.get_version_meta = get_version_meta
Package.get_versions = get_versions
Package.publish = publish
Package.add = add

;['get_meta', 'set_meta', 'get_tarball', 'set_tarball'].forEach(function(key) {
  Package[key] = function() {
    var backend = context().backend

    return backend[key].apply(backend, arguments)
  }
})

function get_versions(name, done) {
  Package.get_meta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    done(null, Object.keys(meta.versions))
  }, done))
}

function get_version_meta(name, version, done) {
  Package.get_meta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    version = meta['dist-tags'][version || 'latest'] || semver.maxSatisfying(
        Object.keys(meta.versions)
      , version || '*'
    )

    if(!version) {
      done()
    }

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
    stream = Package.set_tarball(name, version)
    stream.write(new Buffer(meta._attachments[filename].data, 'base64'))
    stream.end()
  } catch(err) {
    done(err)
  }

  delete meta._attachments
  save_meta(name, version, tags, meta.versions[version], done)
}

function save_meta(name, version, tags, meta, done) {
  Package.get_meta(name, function(err, module_meta) {
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

    Package.set_meta(name, module_meta, function(err) {
      done(err, err ? null : module_meta)
    })
  })
}

function add(name, version, tags, meta, tarball, done) {
  var req

  try {
    req = request(tarball)
    req.pipe(Package.set_tarball(name, version))
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
