var methods = ['GET', 'POST', 'PUT', 'DELETE']
  , qs = require('querystring')

module.exports = Router

function Router(not_found) {
  if(!(this instanceof Router)) {
    return new Router(not_found)
  }

  this.routes = {}
  this.not_found = not_found

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

  for(var i = 0, len = handlers.length; i < len; ++i) {
    match = path.match(handlers[i].pattern)

    if(match) {
      return handlers[i].handler.apply(
          null
        , [req, res].concat(match.slice(1))
      )
    }
  }

  this.not_found(req, res)
}
