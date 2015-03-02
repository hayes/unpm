var runMiddleware = require('./middleware')
var responder = require('./respond')

module.exports = function(unpm) {
  return function handler(req, res) {
    var route = unpm.router.match(req) || null
    var log = unpm.log

    var respond = responder(req, res, unpm)

    res.on('finish', function() {
      if(req.headers.authorization) {
        req.headers.authorization = 'Basic ~~removed~~'
      }

      var info = {
        statusCode: res.statusCode,
        method: req.method,
        url: req.url
      }

      log.info(info)
      log.debug({headers: req.headers})
    })

    if(!unpm.middleware || !unpm.middleware.length) {
      return runRoute()
    }

    runMiddleware(unpm.middleware, respond, route, unpm, runRoute)

    function runRoute(err) {
      if(err) {
        return respond(err)
      }

      if(!route) {
        return respond.notFound()
      }

      route.fn(respond, route, unpm)
    }
  }
}
