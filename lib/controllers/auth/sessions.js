var CLS = require('continuation-local-storage')
  , responses = require('../../responses')
  , User = require('../../models/User')
  , concat = require('concat-stream')

var unpm = CLS.getNamespace('unpm')

module.exports.create = session_request

function session_request(req, res, route, response) {
  var sessions = unpm.get('sessions')

  var load = concat(function(data) {
    try {
      data = JSON.parse(data)
      create_session(data.name, data.password)
    } catch(err) {
      respond(err)
    }
  })

  load.on('error', respond)
  req.pipe(load)

  function create_session(username, password) {
    User.auth(username, password, function(err, user) {
      if(err || !user) {
        return response.unauthorized(req, res)
      }

      sessions.set(user, function() {
        if(err) {
          return respond(err)
        }

        respond(null, 201, {
            'ok': true
          , 'name': username
          , 'roles': []
        })
      })
    })
  }
}
