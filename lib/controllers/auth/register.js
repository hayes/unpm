var responses = require('../../responses')
  , guard = require('../../utils/guard')
  , User = require('../../models/User')
  , load = require('../../utils/load')

module.exports = req_handler

function req_handler(req, res, route, respond) {
  var username = route.splats[0]

  load(req, guard(register, respond))

  function register(data) {
    User.find(username, function(err, user) {
      if(user) {
        return responses.conflict(req, res)
      }

      User.create(username, data, guard(created, respond))
    })
  }

  function created() {
    respond(null, 201, data)
  }
}
