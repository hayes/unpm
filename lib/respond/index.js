var unauthorized = require('./401')
var conflict = require('./409')
var notFound = require('./404')
var onError = require('./500')
var json = require('./json')

module.exports = responder

function responder(req, res, route, unpm) {
  respond.unauthorized = unauthorized
  respond.notFound = notFound
  respond.onError = onError
  respond.conflict = conflict
  respond.route = route
  respond.json = json
  respond.req = req
  respond.res = res

  return respond

  function respond(err, status, data) {
    if(err) {
      unpm.log.error(err)
      return respond.onError(err)
    }

    respond.json(status, data)
  }
}
