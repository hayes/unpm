var CLS = require('continuation-local-storage')
  , responses = require('./responses')

var unpm = CLS.getNamespace('unpm')

module.exports = handler

function handler(req, res) {
  var route = unpm.get('router').match(req)
    , log = unpm.get('log')

  res.on('finish', function() {
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

  unpm.run(function() {
    unpm.set('req', req)
    unpm.set('res', res)
    unpm.set('route', route)
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
