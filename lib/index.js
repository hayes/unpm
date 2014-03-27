var CLS = require('continuation-local-storage')
  , ns = CLS.createNamespace('unpm')

var SessionStore = require('./models/SessionStore')
  , packages = require('./controllers/packages')
  , auth = require('./controllers/auth')
  , Router = require('unpm-router')
  , handler = require('./handler')
  , logging = require('./logging')
  , http = require('http')

module.exports = setup

function setup(config) {
  return ns.run(function() {
    unpm(ns, config)
  })
}

function unpm(ns, config) {
  var router = Router(config.host.pathname)

  handler = ns.bind(handler)

  ns.set('sessions', config.sessions || SessionStore())
  ns.set('server', http.createServer(handler))
  ns.set('log', logging(config))
  ns.set('port', config.port || 8123)
  ns.set('backend', config.backend)
  ns.set('handler', handler)
  ns.set('router', router)
  ns.set('config', config)

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
