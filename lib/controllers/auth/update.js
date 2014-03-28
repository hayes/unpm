var responses = require('../../responses')
  , guard = require('../../utils/guard')
  , User = require('../../models/User')
  , load = require('../../utils/load')

module.exports = req_handler

function req_handler(req, res, route, respond) {
  var username = route.splats[0]

  load(req, guard(update, respond))

  function update(data) {
    var pass = new Buffer(req.headers.authorization.split(' ')[1], 'base64')
      .toString().split(':')[1]

    User.auth(username, pass, got_user)

    function got_user(err, user) {
      if(err || !user) {
        return responses.unauthorized(req, res)
      }

      User.update(user, data, updated)
    }

    function updated(err, user) {
      if(err || !user) {
        return respond(err)
      }

      respond(null, 201, user)
    }
  }
}
