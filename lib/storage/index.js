var levelup = require('levelup')
  , db = levelup('./db')

module.exports.add = add
module.exports.get_meta = get_meta
module.exports.set_meta = set_meta
module.exports.get_package = get_package
module.exports.get_versions = get_versions
module.exports.get_module_meta = get_module_meta

function get_versions(name, done) {
  db.get(name, function(err, meta) {
    if(err || !meta) {
      return done(err)
    }

    done(null, meta.versions)
  })
}

function get_module_meta(name, done) {
  db.get(name, db_resonse(done))
}

function set_module_meta(name, meta, done) {
  db.put(name, JSON.stringify(meta), done)
}

function get_meta(name, version, done) {
  db.get(name + '@' + version, db_resonse(done))
}

function set_meta(name, version, meta, done) {
  db.put(name + '@' + version, JSON.stringify(meta), done)
}

function add(name, version, tags, meta, done) {
  get_versions(name, set_version_list, done)

  function set_version_list(err, versions) {
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
    set_module_meta(name, module_meta, guard(save_meta, done))
  }

  function save_meta() {
    set_meta(name, version, meta, done)
  }
}

function db_resonse(done) {
  return function(err, data) {
    done(err, data ? JSON.parse(data) : [])
  }
}

function get_package(name, version, done) {
  done(new Error('not implemented'))
}

function guard(done) {
  return function(err, data) {
    if(err) {
      return done(err)
    }

    done.apply(null, [].slice.call(arguments, 1))
  }
}
