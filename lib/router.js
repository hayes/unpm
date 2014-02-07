var methods = ['GET', 'POST', 'PUT', 'DELETE']
  , qs = require('querystring')

module.exports = Router

function Router(app, not_found, root) {
  if(!(this instanceof Router)) {
    return new Router(app, not_found, root)
  }

  this.routes = {}
  this.root = root || ''
  this.not_found = not_found
  this.app = app

  for(var i = 0; i < methods.length; ++i) {
    this.routes[methods[i]] = []
  }

  this.handler = handler.bind(this)
}

Router.prototype.add = function add(method, pattern, handler) {
  this.routes[method.toUpperCase()].push({pattern: pattern, handler: handler})
}

function handler(req, res) {
  var handlers = this.routes[req.method]
    , path = req.url.split('?')[0]
    , match

  req.query = qs.parse(req.url.split('?')[1])

  if(this.root && !path.slice(0, this.root.length) !== this.root) {
    return this.not_found(req, res)
  }

  path = path.slice(this.root.length)

  for(var i = 0, len = handlers.length; i < len; ++i) {
    match = path.match(handlers[i].pattern)

    if(match) {
      return handlers[i].handler.apply(
          null
        , [this.app, req, res].concat(match.slice(1))
      )
    }
  }

  this.not_found(req, res)
}
