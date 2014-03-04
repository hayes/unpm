var Router = require('unpm-router')
  , handler = require('./handler')
  , init = require('./init')

module.exports = setup

function setup(config) {
  var app = init(config)

  var router = Router(app.pathname)
    , packages = require('./packages')(app)
    , auth = require('./auth')(app)

  app.router = router
  app.handler = handler(app)

  // auth
  router.add('GET', routes.get_user, auth.user)
  router.add('PUT', routes.register, auth.register)
  router.add('PUT', routes.update_user, auth.update)
  router.add('POST', routes.session, auth.sessions.create)

  // packages
  router.add('PUT', routes.publish, packages.publish)
  router.add('GET', routes.get_tarball, packages.get_tarball)
  router.add('GET', routes.get_package, packages.get_package)

  // clone from public npm
  router.add('POST', routes.clone, packages.clone)
  router.add('POST', routes.get_deps, packages.get_deps)

  return app
}

var routes = {
    index: '/'
  , get_package: '/:name/:version?'
  , get_user: '/-/user/org.couchdb.user:*'
  , get_tarball: '/:name/-/*-*.tgz'
  , publish: '/:name'
  , clone: '/clone/:name/:version?'
  , get_deps: '/get_deps/:name/:version?'
  , session: '/_session'
  , register: '/-/user/org.couchdb.user:*'
  , update_user: '/-/user/org.couchdb.user:*/*'
}
