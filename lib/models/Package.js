var guard = require('../utils/guard')
  , context = require('../context')
  , request = require('request')
  , semver = require('semver')
  , path = require('path')
  , Package = {}

module.exports = Package

Package.getVersionMeta = getVersionMeta
Package.getVersions = getVersions
Package.publish = publish
Package.add = add

;['getMeta', 'setMeta', 'getTarball', 'setTarball'].forEach(function(key) {
  Package[key] = function() {
    var backend = context().backend

    return backend[key].apply(backend, arguments)
  }
})

function getVersions(name, done) {
  Package.getMeta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    done(null, Object.keys(meta.versions))
  }, done))
}

function getVersionMeta(name, version, done) {
  Package.getMeta(name, guard(function(meta) {
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
    stream = Package.setTarball(name, version)
    stream.write(new Buffer(meta._attachments[filename].data, 'base64'))
    stream.end()
  } catch(err) {
    done(err)
  }

  delete meta._attachments
  save_meta(name, version, tags, meta.versions[version], done)
}

function save_meta(name, version, tags, meta, done) {
  Package.getMeta(name, function(err, module_meta) {
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

    Package.setMeta(name, module_meta, function(err) {
      done(err, err ? null : module_meta)
    })
  })
}

function add(name, version, tags, meta, tarball, done) {
  var req

  try {
    req = request(tarball)
    req.pipe(Package.setTarball(name, version))
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
