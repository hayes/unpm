var init_config = require('./config')
  , Router = require('./router')

module.exports = setup

function setup(config) {
  config = init_config(config)

  var router = Router(config, config.responses.not_found, config.pathname)
    , packages = require('./packages')(config)
    , auth = require('./auth')(config)

  // auth
  router.add('GET', routes.get_user, auth.get_user)
  router.add('PUT', routes.register, auth.register)
  router.add('PUT', routes.update_user, auth.update)
  router.add('POST', routes.session, auth.create_session)

  // packages
  router.add('PUT', routes.publish, packages.publish)
  router.add('GET', routes.get_tarball, packages.get_tarball)
  router.add('GET', routes.get_package, packages.get_package)
  router.add('GET', routes.get_package_ver, packages.get_package)

  // clone from public npm
  router.add('POST', routes.clone, packages.clone)
  router.add('POST', routes.clone_ver, packages.clone)

  return router
}

var routes = {
    index: /^$/
  , get_package: /^([^\/]*)$/
  , get_package_ver: /^([^\/]*)\/([^\/]*)$/
  , get_user: /^-\/user\/org\.couchdb.user:([^\/]*)$/
  , get_tarball: /^([^\/]*)\/-\/.*-(\d+\.\d+\.\d+).tgz$/
  , clone: /^\/clone\/([^\/]*)$/
  , session: /^_session$/
  , clone_ver: /^\/clone\/([^\/]*)\/([^\/]*)$/
  , publish: /^([^\/]*)$/
  , register: /^-\/user\/org\.couchdb.user:([^\/]*)$/
  , update_user: /^-\/user\/org\.couchdb.user:([^\/]*)\/.+$/
}
