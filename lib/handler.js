var run_middleware = require('./middleware')
  , create_respond = require('./respond')
  , get_context = require('./context')

module.exports = function(req, res) {
  get_context.ns.run(function(context) {
    handler(req, res)
  })
}

function handler(req, res) {
  var context = get_context()

  var respond =  create_respond(req, res, context)
    , route = context.router.match(req)
    , log = context.log

  res.on('finish', function() {
    if(req.headers.authorization) {
      var auth = new Buffer('hunter2:hunter2').toString('base64')

      req.headers.authorization = 'Basic ' + auth
    }

    var info = {
        statusCode: res.statusCode
      , method: req.method
      , url: req.url
    }

    log.info(info)
    log.debug({headers: req.headers})
  })

  context.req = req
  context.res = res
  context.route = route
  context.respond = respond

  if(!route) {
    return respond.not_found()
  }

  if(!context.middleware || !context.middleware.length) {
    return run_route()
  }

  run_middleware(context, context.middleware, run_route)

  function run_route(err) {
    if(err) {
      return respond(err)
    }

    route.fn(context, route, respond)
  }
}
