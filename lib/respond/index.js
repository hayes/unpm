var context = require('../context')

var unauthorized = require('./401')
  , not_found = require('./404')
  , on_error = require('./500')
  , conflict = require('./409')
  , json = require('./json')

module.exports = create_responder

function create_responder(req, res) {
  var respond = context.ns.bind(base_respond)

  respond.unauthorized = unauthorized
  respond.not_found = not_found
  respond.on_error = on_error
  respond.conflict = conflict
  respond.json = json
  respond.context = context()
  respond.req = req
  respond.res = res

  return respond

  function base_respond(err, status, data) {
    if(err) {
      respond.context.log.error(err)

      return respond.on_error(err)
    }

    respond.json(status, data)
  }
}
