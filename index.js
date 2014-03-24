var backend = require('unpm-fs-backend')
  , unpm = require('./lib/index')
  , mkdirp = require('mkdirp')
  , path = require('path')

module.exports = function(port) {
  var data_dir = path.join(process.cwd(), 'data')
    , config = {}
    , db

  var tarballs_dir = path.join(data_dir, 'tarballs')
    , user_dir = path.join(data_dir, 'users')
    , meta_dir = path.join(data_dir, 'meta')

  config.backend = backend(meta_dir, user_dir, tarballs_dir)

  unpm(config).server.listen(port || 8123)
  console.log('Started unpm on port %s', port || 8123)
}
