var unauthorized = require('../api/401')
  , concat = require('concat-stream')
  , on_error = require('../api/500')
  , Users = require('./user-store')
  , crypto = require('crypto')

var sessions = {}

module.exports.create = session_request

function session_request(req, res) {
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
    Users.auth(username, password, function(err, user) {
      if(err || !user) {
        return unauthorized(req, res)
      }

      var token = create_token()

      sessions[token] = user
      res.writeHead(200, {
          'Content-Type': 'application/json'
        , 'Set-Cookie': 'AuthSession=' + token
      })
      res.write(JSON.stringify({
          'ok': true
        , 'name': username
        , 'roles': []
      }))
      res.end()
    })
  }
}

function create_token() {
  return crypto.randomBytes(30).toString('hex')
}
