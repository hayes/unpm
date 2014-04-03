var controllers = require('./lib/controllers')
  , handler = require('./lib/handler')
  , logging = require('./lib/logging')
  , context = require('./lib/context')
  , Router = require('unpm-router')
  , auth = require('unpm-auth')
  , http = require('http')

module.exports = setup

function setup(config) {
  return context.ns.run(function(new_context) {
    unpm.call(new_context, context.ns, config)
  })
}

function unpm(ns, config) {
  var router = Router(config.base_pathname)
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
  self.backend = {}
  auth(self)

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
  router.add('GET', '/:name/-/*-*.tgz', controllers.get_tarball)
  router.add('GET', '/:name/:version?', controllers.get_package)
}
