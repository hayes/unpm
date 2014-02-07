var levelup = require('levelup')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , fs = require('fs')

module.exports = setup

function setup(data_path) {
  var tar_dir = path.join(data_path, 'files')
    , module_db
    , user_db

  mkdirp.sync(tar_dir)
  module_db = levelup(path.join(data_path, 'db'))
  user_db = levelup(path.join(data_path, 'users'))

  return {
      get_user: get_user
    , set_user: set_user
    , get_meta: get_meta
    , set_meta: set_meta
    , get_tarball: get_tarball
    , set_tarball: set_tarball
    , get_module_meta: get_module_meta
    , set_module_meta: set_module_meta
  }

  function get_user(name, done) {
    user_db.get(name, db_resonse(done))
  }

  function set_user(name, data, done) {
    user_db.put(name, JSON.stringify(data), done)
  }

  function get_module_meta(name, done) {
    module_db.get(name, db_resonse(done))
  }

  function set_module_meta(name, meta, done) {
    module_db.put(name, JSON.stringify(meta), done)
  }

  function get_meta(name, version, done) {
    module_db.get(name + '@' + version, db_resonse(done))
  }

  function set_meta(name, version, meta, done) {
    module_db.put(name + '@' + version, JSON.stringify(meta), done)
  }

  function get_tarball(name, version) {
    return fs.createReadStream(
        tar_dir + '/' + name + '/' + name + version + '.tgz'
    )
  }

  function set_tarball(name, version) {
    var dir = path.join(tar_dir, name)

    mkdirp.sync(dir)

    return fs.createWriteStream(
        dir + '/' + name + version + '.tgz'
    )
  }
}

function db_resonse(done) {
  return function(err, data) {
    try {
      done(err, data ? JSON.parse(data) : [])
    } catch(err) {
      done(err)
    }
  }
}
