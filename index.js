var fs_tarballs = require('fnpm-fs-tarballs')
  , backend = require('unpm-leveldb')
  , unpm = require('./lib/index')
  , levelup = require('levelup')
  , mkdirp = require('mkdirp')
  , path = require('path')

module.exports = function(port) {
  var data_dir = path.join(process.cwd(), 'data')
    , config = {}
    , db

  var tarballs_dir = path.join(data_dir, 'tarballs')

  mkdirp.sync(tarballs_dir)
  db = levelup(path.join(data_dir, 'db'))
  config.backend = fs_tarballs(backend(db), tarballs_dir)

  unpm(config).server.listen(port || 8123)
  console.log('Started unpm on port %s', port || 8123)
}
