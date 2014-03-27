var load_config = require('./lib/config')
  , backend = require('unpm-fs-backend')
  , unpm = require('./lib/index')
  , path = require('path')

var CWD = process.cwd()

module.exports = function(config) {
  var unpm_service
    , tarballs_dir
    , user_dir
    , meta_dir

  config = load_config(config || {})

  if(!config.backend) {
    tarballs_dir = path.join(CWD, 'tarballs')
    user_dir = path.join(CWD, 'users')
    meta_dir = path.join(CWD, 'meta')

    config.backend = backend(meta_dir, user_dir, tarballs_dir)
  }

  unpm_service = unpm(config)
  unpm_service.server.listen(unpm_service.config.port)

  unpm_service.log.info('Started unpm on port %s', unpm_service.config.port)
}
