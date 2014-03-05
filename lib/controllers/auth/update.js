var responses = require('../../responses')
  , User = require('../../models/User')
  , concat = require('concat-stream')

module.exports = req_handler

function req_handler(req, res, route, respond) {
  var username = route.splats[0]

  var load = concat(function(data) {
    try {
      update(username, JSON.parse(data.toString()))
    } catch(err) {
      respond(err)
    }
  })

  load.on('error', respond)
  req.pipe(load)

  function update(username, data) {
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
