var load_config = require('./lib/config')
  , backend = require('unpm-fs-backend')
  , unpm = require('./lib/index')
  , path = require('path')

module.exports = function(config) {
  var unpm_service
    , tarballs_dir
    , user_dir
    , meta_dir

  config = load_config(config || {})

  config.data_path = config.data_path ? path.normalize(config.data_path) :
      path.join(process.cwd(), 'data')

  tarballs_dir = path.join(config.data_path, 'tarballs')
  user_dir = path.join(config.data_path, 'users')
  meta_dir = path.join(config.data_path, 'meta')

  config.backend = backend(meta_dir, user_dir, tarballs_dir)

  unpm_service = unpm(config)
  unpm_service.server.listen(unpm_service.port)

  unpm_service.log.info('Started unpm on port %s', unpm_service.port)
}
