var controllers = require('./lib/controllers')
  , add_defaults = require('./lib/config')
  , handler = require('./lib/handler')
  , logging = require('./lib/logging')
  , context = require('./lib/context')
  , Router = require('unpm-router')
  , cidr = require('./lib/cidr')
  , auth = require('unpm-auth')
  , http = require('http')

module.exports = setup

function setup(config) {
  return context.ns.run(function(new_context) {
    unpm.call(new_context, context.ns, add_defaults(config))
  })
}

function unpm(ns, config) {
  var router = Router(config.basePathname)
    , self = this

  handler = ns.bind(handler)

  self.server = http.createServer(handler)
  self.log = logging(config)
  self.port = config.port || 8123
  self.handler = handler
  self.get_context = {}
  self.router = router
  self.config = config
  self.middleware = []
  self.backend = Object.create(config.backend)
  auth(self)
  cidr(self)

  if(config.checkAuth) {
    self.middleware.push(auth.check_auth)
  }

  Object.keys(config.backend).forEach(function(key) {
    self.backend[key] = function() {
      var args = [].slice.call(arguments)

      if(typeof args[args.length - 1] === 'function') {
        args.push(ns.bind(args.pop()))
      }

      return config.backend[key].apply(self.backend, args)
    }
  })

  router.add('PUT', '/:name', controllers.publish)
  router.add('GET', '/:name/-/:name/:version.tgz', controllers.get_tarball)
  router.add('GET', '/:name/:version?', controllers.get_package)
  router.add('PUT', '/:name/-rev/:rev?', controllers.unpublish.some)
  router.add('DELETE', '/:name/-rev/:rev?', controllers.unpublish.all)
  router.add(
      'DELETE'
    , '/:name/-/:file/-rev/:rev'
    , controllers.unpublish.tarball
  )
}
