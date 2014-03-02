var routing = require('route-emitter')
  , init = require('./init')

module.exports = setup

function setup(config) {
  var app = init(config)

  var router = routing.createRouter()
    , packages = require('./packages')(app)
    , auth = require('./auth')(app)

  app.router = router

  // auth
  router.listen('GET', routes.get_user, auth.user)
  router.listen('PUT', routes.register, auth.register)
  router.listen('PUT', routes.update_user, auth.update)
  router.listen('POST', routes.session, auth.create_session)

  // packages
  router.listen('PUT', routes.publish, packages.publish)
  router.listen('GET', routes.get_tarball, packages.get_tarball)
  router.listen('GET', routes.get_package, packages.get_package)
  router.listen('GET', routes.get_package_ver, packages.get_package)

  // clone from public npm
  router.listen('POST', routes.clone, packages.clone)
  router.listen('POST', routes.clone_ver, packages.clone)
  router.listen('POST', routes.get_deps, packages.get_deps)
  router.listen('POST', routes.get_deps_ver, packages.get_deps)

  router.listen('*', '*', app.responses.not_found)

  return app
}

var routes = {
    index: /^$/
  , get_package: /^\/([^\/]*)$/
  , get_package_ver: /^\/([^\/]*)\/([^\/]*)$/
  , get_user: /^\/-\/user\/org\.couchdb.user:([^\/]*)$/
  , get_tarball: /^\/([^\/]*)\/-\/.*-(\d+\.\d+\.\d+).tgz$/
  , publish: /^\/([^\/]*)$/
  , clone: /^\/clone\/([^\/]*)$/
  , clone_ver: /^\/clone\/([^\/]*)\/([^\/]*)$/
  , get_deps: /^\/get_deps\/([^\/]*)$/
  , get_deps_ver: /^\/get_deps\/([^\/]*)\/([^\/]*)$/
  , session: /^\/_session$/
  , register: /^\/-\/user\/org\.couchdb.user:([^\/]*)$/
  , update_user: /^\/-\/user\/org\.couchdb.user:([^\/]*)\/.+$/
}
