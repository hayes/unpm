var CLS = require('continuation-local-storage')
  , responses = require('./responses')

var unpm = CLI.getNamespace('unpm')

module.exports = handler

function handler(req, res) {
  var action = app.router.match(req)
    , log = unpm.get('log')

  res.on('finish', function() {
    log.http(res.statusCode, req.url)
  })

  if(!action) {
    return app.responses.not_found(req, res)
  }

  unpm.run(function() {
    action.fn(req, res, action, respond)
  })

  function respond(err, status, data) {
    if(err) {
      log.error('500', err.stack)

      return responses.on_error(req, res, err)
    }

    responses.json(req, res, status, data)
  }
}
