var responses = require('./responses')
  , get_context = require('./context')

module.exports = handler

function handler(req, res) {
  var context = get_context()
    , log = context.log

  var route = context.router.match(req)

  res.on('finish', function() {
    var auth = new Buffer('hunter2:hunter2').toString('base64')

    req.headers.authorization = 'Basic ' + auth

    var info = {
        statusCode: res.statusCode
      , url: req.url
      , headers: req.headers
    }

    log.info(info)
  })

  if(!route) {
    return responses.not_found(req, res)
  }

  get_context.ns.run(function(context) {
    context.req = req
    context.res = res
    context.route = route
    route.fn(req, res, route, respond)
  })

  function respond(err, status, data) {
    if(err) {
      log.error(err)

      return responses.on_error(req, res, err)
    }

    try {
      data = JSON.stringify(data)
    } catch(err) {
      return responses.on_error(req, res, err)
    }

    responses.json(req, res, status, data)
  }
}
