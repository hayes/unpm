var guard = require('../utils/guard')
var latest_version = require('../utils/latest-version')
var semver = require('semver')

var methods = [
  'getMeta',
  'setMeta',
  'removeMeta',
  'getTarball',
  'getTarballAsync',
  'setTarball',
  'removeTarball'
]

module.exports = Package

function Package(unpm) {
  if(!(this instanceof Package)) {
    return new Package(unpm)
  }

  var self = this
  methods.forEach(function(method) {
    self[method] = unpm.backend[method] && unpm.backend[method].bind(unpm.backend)
  })
}

Package.prototype.getVersionMeta = getVersionMeta
Package.prototype.removeVersion = removeVersion
Package.prototype.getVersions = getVersions
Package.prototype._setMeta = _setMeta
Package.prototype.saveMeta = saveMeta
Package.prototype.publish = publish
Package.prototype.remove = remove

var metaKeys = [
    'author'
  , 'bugs'
  , 'description'
  , 'homepage'
  , 'keywords'
  , 'license'
  , 'maintainers'
  , 'readme'
  , 'readmeFilename'
  , 'repository'
]

function _setMeta(name, meta, done) {
  meta._rev = ~~meta._rev + 1
  this.setMeta(name, meta, done)
}

function remove(name, done) {
  var self = this

  self.getVersions(name, function(err, versions) {
    if(err || !versions.length) {
      return done(err)
    }

    var remaining = versions.length
      , returned

    versions.forEach(function(version) {
      self.removeTarball(name, version, removed)
    })

    function removed(err) {
      if(returned) {
        return
      }

      if(err) {
        returned = true

        return done(err)
      }

      if(!--remaining) {
        returned = true
        self.removeMeta(name, done)
      }
    }
  })
}

function removeVersion(name, version, done) {
  var self = this

  self.getMeta(name, function(err, meta) {
    if(err) {
      return done(err)
    }

    version = versionFromMeta(meta, version)

    var versionMeta = meta.versions[version]

    if(!version || !versionMeta) {
      return done()
    }

    delete meta.versions[version]

    meta['dist-tags'].latest = latest_version(Object.keys(meta.versions))

    if(Object.keys(meta.versions).length) {
      self._setMeta(name, meta, removeTarball)
    } else {
      self.removeMeta(name, meta, removeTarball)
    }
  })

  function removeTarball(err, data) {
    if(err) {
      return done(err)
    }

    self.removeTarball(name, version, function(err) {
      done(err, data)
    })
  }
}

function getVersions(name, done) {
  this.getMeta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    done(null, Object.keys(meta.versions))
  }, done))
}

function versionFromMeta(meta, version) {
  return meta['dist-tags'][version || 'latest'] || semver.maxSatisfying(
      Object.keys(meta.versions)
    , version || '*'
  )
}

function getVersionMeta(name, version, done) {
  this.getMeta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    version = versionFromMeta(meta, version)

    if(!version) {
      done()
    }

    var versionMeta = meta.versions[version]

    if(!versionMeta._id) {
      versionMeta._id = name + '@' + version
    }

    done(null, versionMeta)
  }, done))
}

function publish(meta, done) {
  var tags = meta['dist-tags']
  var name = meta.name
  var fixedVersion
  var filename
  var version
  var stream

  try {
    version = tags.latest
    filename = name + '-' + version + '.tgz'
    fixedVersion = version.replace(
        /^[\d\.]*/
      , version.match(/^[\d\.]*/)[0].split('.').map(function(val) {
          return +val
        }).join('.')
    )
    meta.versions[fixedVersion] = meta.versions[version]
    stream = this.setTarball(name, fixedVersion)
    stream.write(new Buffer(meta._attachments[filename].data, 'base64'))
    stream.end()
  } catch(err) {
    done(err)
  }

  delete meta._attachments
  this.saveMeta(name, fixedVersion, tags, meta, done)
}

function saveMeta(name, version, tags, meta, done) {
  var self = this

  this.getMeta(name, function(err, module_meta) {
    module_meta = module_meta || {'dist-tags': {}, versions: {}, name: name}

    var versions = Object.keys(module_meta.versions)

    module_meta.versions[version] = meta.versions[version]
    versions.push(version)

    module_meta['dist-tags'].latest = latest_version(versions)

    Object.keys(tags).forEach(function(tag) {
      if(!module_meta['dist-tags'][tag]) {
        module_meta['dist-tags'][tag] = tags[tag]
      }
    })

    if(versions[0] === version) {
      for(var i = 0, l = metaKeys.length; i < l; ++i) {
        module_meta[metaKeys[i]] = meta[metaKeys[i]]
      }
    }

    delete meta.readme

    self._setMeta(name, module_meta, function(err) {
      done(err, err ? null : module_meta)
    })
  })
}
