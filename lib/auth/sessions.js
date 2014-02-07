var concat = require('concat-stream')
  , crypto = require('crypto')

module.exports.create = session_request
module.exports.setup = setup

function setup(app) {
  app.sessionStore = app.sessionStore || create_session_store()
}

function session_request(app, req, res) {
  var unauthorized = app.response.unauthorized
    , on_error = app.response.error
    , User = app.models.User
    , ok = app.responses.ok

  req.pipe(concat(function(data) {
    try {
      data = JSON.parse(data)
      create_session(data.name, data.password)
    } catch(err) {
      on_error(req, res, err)
    }
  })).on('error', function(err) {
    on_error(req, res, err)
  })

  function create_session(username, password) {
    User.auth(username, password, function(err, user) {
      if(err || !user) {
        return unauthorized(req, res)
      }

      app.sessionStore.set(user, respond)
    })

    function respond(err, token) {
      if(err) {
        return on_error(req, res, err)
      }

      ok(req, res, JSON.stringify({
          'ok': true
        , 'name': username
        , 'roles': []
      }))
    }
  }
}

function create_session_store() {
  var sessions = {}

  return {set: set, get: get}

  function set(data, done) {
    var token = create_token()

    sessions[token] = data
    done(null, token)
  }

  function get(token, done) {
    done(null, sessions[token])
  }
}

function create_token() {
  return crypto.randomBytes(30).toString('hex')
}
