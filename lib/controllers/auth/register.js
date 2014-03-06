var responses = require('../../responses')
  , User = require('../../models/User')
  , concat = require('concat-stream')

module.exports = req_handler

function req_handler(req, res, route, respond) {
  var username = route.splats[0]

  var load = concat(function(data) {
    try {
      register(username, JSON.parse(data.toString()))
    } catch(err) {
      respond(err)
    }
  })

  load.on('error', respond)
  req.pipe(load)

  function register(username, data) {
    User.find(username, function(err, user) {
      if(user) {
        return responses.conflict(req, res)
      }

      User.create(username, data, function(err) {
        if(err) {
          return respond(err)
        }

        respond(null, 201, data)
      })
    })
  }
}
