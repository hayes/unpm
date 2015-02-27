var Router = require('unpm-router')
var auth = require('unpm-auth')
var http = require('http')

var controllers = require('./lib/controllers')
var Package = require('./lib/models/Package')
var add_defaults = require('./lib/config')
var logging = require('./lib/logging')
var handler = require('./lib/handler')
var cidr = require('./lib/cidr')

module.exports = unpm

function unpm(config, User, backend) {
  if(!(this instanceof unpm)) {
    return new unpm(config, User, backend)
  }

  config = add_defaults(config)
  this.router = Router(config.basePathname)
  this.handler = handler(this)
  this.server = http.createServer(this.handler)
  this.log = logging(config)
  this.port = config.port || 8123
  this.config = config
  this.middleware = []
  this.backend = Object.create(config.backend || {})

  if(backend) {
    config.backend = backend
  }

  if(User) {
    config.User = User
  }

  this.Package = Package(this)
  auth(this, config.User)
  cidr(this)

  this.router.add('PUT', '/:name', controllers.publish)
  this.router.add('GET', '/:name/-/:name/:version.tgz', controllers.getTarball)
  this.router.add('GET', '/:name/:version?', controllers.getPackage)
  this.router.add('PUT', '/:name/-rev/:rev?', controllers.unpublish.some)
  this.router.add('DELETE', '/:name/-rev/:rev?', controllers.unpublish.all)
  this.router.add('DELETE', '/:name/-/:file/-rev/:rev', controllers.unpublish.tarball)
}
