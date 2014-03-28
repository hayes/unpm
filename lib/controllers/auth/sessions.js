var responses = require('../../responses')
  , guard = require('../../utils/guard')
  , User = require('../../models/User')
  , context = require('../../context')
  , load = require('../../utils/load')

module.exports.create = session_request

function session_request(req, res, route, respond) {
  load(req, guard(create_session))

  function create_session(data) {
    var sessions = context().sessions
      , username = data.username
      , password = data.password

    User.auth(username, password, function(err, user) {
      if(err || !user) {
        return response.unauthorized(req, res)
      }

      sessions.set(user, guard(got_session, respond))
    })
  }

  function got_session() {
    respond(null, 201, {
        'ok': true
      , 'name': username
      , 'roles': []
    })
  }
}
