var backend = require('unpm-fs-backend')
  , unpm = require('./lib/index')
  , path = require('path')

module.exports = function(config) {
  var data_dir = path.join(process.cwd(), 'data')
    , unpm_service

  var tarballs_dir = path.join(data_dir, 'tarballs')
    , user_dir = path.join(data_dir, 'users')
    , meta_dir = path.join(data_dir, 'meta')

  config.backend = backend(meta_dir, user_dir, tarballs_dir)

  unpm_service = unpm(config)
  unpm_service.server.listen(unpm_service.port)

  log.info('Started unpm on port %s', unpm_service.port)
}
