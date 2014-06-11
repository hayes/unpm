var guard = require('../utils/guard')
  , context = require('../context')
  , semver = require('semver')
  , path = require('path')
  , Package = {}

module.exports = Package

Package.getVersionMeta = get_version_meta
Package.removeVersion = remove_version
Package.getVersions = get_versions
Package.publish = publish
Package.remove = remove

var methods = [
    'getMeta'
  , 'setMeta'
  , 'removeMeta'
  , 'getTarball'
  , 'setTarball'
  , 'removeTarball'
]

var meta_keys = [
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

methods.forEach(function(key) {
  Package[key] = function() {
    var backend = context().backend

    return backend[key].apply(backend, [].slice.call(arguments))
  }
})

function set_meta(name, meta, done) {
  meta._rev = ~~meta._rev + 1
  Package.setMeta(name, meta, done)
}

function remove(name, done) {
  Package.getVersions(name, function(err, versions) {
    if(err || !versions.length) {
      return done(err)
    }

    var remaining = versions.length
      , returned

    versions.forEach(function(version) {
      Package.removeTarball(name, version, removed)
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
        Package.removeMeta(name, done)
      }
    }
  })
}

function remove_version(name, version, done) {
  Package.getMeta(name, function(err, meta) {
    if(err) {
      return done(err)
    }

    version = version_from_meta(meta, version)

    var version_meta = meta.versions[version]

    if(!version || !version_meta) {
      return done()
    }

    delete meta.versions[version]

    meta['dist-tags'].latest = Object.keys(meta.versions).sort(semver.lt)[0]

    if(Object.keys(meta.versions).length) {
      set_meta(name, meta, remove_tarball)
    } else {
      Package.removeMeta(name, meta, remove_tarball)
    }
  })

  function remove_tarball(err, data) {
    if(err) {
      return done(err)
    }

    Package.removeTarball(name, version, function(err) {
      done(err, data)
    })
  }
}

function get_versions(name, done) {
  Package.getMeta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    done(null, Object.keys(meta.versions))
  }, done))
}

function version_from_meta(meta, version) {
  return meta['dist-tags'][version || 'latest'] || semver.maxSatisfying(
      Object.keys(meta.versions)
    , version || '*'
  )
}

function get_version_meta(name, version, done) {
  Package.getMeta(name, guard(function(meta) {
    if(!meta) {
      return done()
    }

    version = version_from_meta(meta, version)

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

  var fixed_version = version.replace(
      /^[\d\.]*/
    , version.match(/^[\d\.]*/)[0].split('.').map(function(val) {
        return +val
      }).join('.')
  )

  meta.versions[fixed_version] = meta.versions[version]

  try {
    stream = Package.setTarball(name, fixed_version)
    stream.write(new Buffer(meta._attachments[filename].data, 'base64'))
    stream.end()
  } catch(err) {
    done(err)
  }

  delete meta._attachments
  save_meta(name, fixed_version, tags, meta, done)
}

function save_meta(name, version, tags, meta, done) {
  Package.getMeta(name, function(err, module_meta) {
    module_meta = module_meta || {'dist-tags': {}, versions: {}, name: name}

    var versions = Object.keys(module_meta.versions)

    module_meta.versions[version] = meta.versions[version]
    versions.push(version)

    versions.sort(semver.lt)
    module_meta['dist-tags'].latest = versions[0]

    Object.keys(tags).forEach(function(tag) {
      if(!module_meta['dist-tags'][tag]) {
        module_meta['dist-tags'][tag] = tags[tag]
      }
    })

    if(versions[0] === version) {
      for(var i = 0, l = meta_keys.length; i < l; ++i) {
        module_meta[meta_keys[i]] = meta[meta_keys[i]]
      }
    }

    delete meta.readme

    set_meta(name, module_meta, function(err) {
      done(err, err ? null : module_meta)
    })
  })
}
