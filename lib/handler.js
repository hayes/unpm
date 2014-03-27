var responses = require('./responses')
  , context = require('./context')

module.exports = handler

function handler(req, res) {
  var current_context = context()
    , log = current_context.log

  var route = current_context.router.match(req)

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

  context.run(function(context) {
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
