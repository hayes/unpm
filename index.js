var SessionStore = require('./lib/models/SessionStore')
  , packages = require('./lib/controllers/packages')
  , auth = require('./lib/controllers/auth')
  , handler = require('./lib/handler')
  , logging = require('./lib/logging')
  , ns = require('./lib/context').ns
  , Router = require('unpm-router')
  , http = require('http')

module.exports = setup

function setup(config) {
  return ns.run(function(context) {
    unpm.call(context, ns, config)
  })
}

function unpm(ns, config) {
  var router = Router(config.base_pathname)

  handler = ns.bind(handler)

  this.sessions = config.sessions || SessionStore()
  this.server = http.createServer(handler)
  this.log = logging(config)
  this.port = config.port || 8123
  this.backend = config.backend
  this.handler = handler
  this.router = router
  this.config = config
  this.middleware = []

  // auth
  router.add('GET', routes.get_user, auth.user)
  router.add('PUT', routes.register, auth.register)
  router.add('PUT', routes.update_user, auth.update)
  router.add('POST', routes.session, auth.sessions.create)

  // packages
  router.add('PUT', routes.publish, packages.publish)
  router.add('GET', routes.get_tarball, packages.get_tarball)
  router.add('GET', routes.get_package, packages.get_package)
}

var routes = {
    index: '/'
  , get_package: '/:name/:version?'
  , get_user: '/-/user/org.couchdb.user:*'
  , get_tarball: '/:name/-/*-*.tgz'
  , publish: '/:name'
  , session: '/_session'
  , register: '/-/user/org.couchdb.user:*'
  , update_user: '/-/user/org.couchdb.user:*/*'
}
