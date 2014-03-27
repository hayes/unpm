var backend = require('unpm-fs-backend')
  , load_config = require('./config')
  , unpm = require('./lib/index')
  , path = require('path')

module.exports = function(config) {
  var unpm_service
    , tarballs_dir
    , user_dir
    , meta_dir

  config = load_config(config || {})

  tarballs_dir = path.join(config.data_dir, 'tarballs')
  user_dir = path.join(config.data_dir, 'users')
  meta_dir = path.join(config.data_dir, 'meta')

  config.backend = backend(meta_dir, user_dir, tarballs_dir)

  unpm_service = unpm(config)
  unpm_service.server.listen(unpm_service.port)

  log.info('Started unpm on port %s', unpm_service.port)
}
