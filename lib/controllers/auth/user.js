var responses = require('../../responses')
  , User = require('../../models/User')

module.exports = get_user

function get_user(req, res, route, respond) {
  var username = route.splats[0]

  User.find(username, function(err, user) {
    if(err) {
      return respond(err)
    }

    if(!username) {
      return responses.not_found(req, res)
    }

    respond(null, 200, user)
  })
}
