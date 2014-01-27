var unauthorized = require('../api/401')
  , concat = require('concat-stream')
  , on_error = require('../api/500')
  , conflict = require('../api/409')
  , Users = require('./user-store')

module.exports = req_handler

function req_handler(req, res, username) {
  req.pipe(concat(function(data) {
    try {
      update(username, JSON.parse(data.toString()))
    } catch(err) {
      on_error(req, res, err)
    }
  })).on('error', function(err) {
    on_error(req, res, err)
  })

  function update(username, data) {
    var pass = new Buffer(req.headers.authorization.split(' ')[1], 'base64')
      .toString().split(':')[1]

    Users.auth(username, pass, got_user)

    function got_user(err, user) {
      if(err || !user) {
        return unauthorized(req, res)
      }

      Users.update(user, data, updated)
    }

    function updated(err, user) {
      if(err || !user) {
        return on_error(req, res, err)
      }

      res.writeHead(201, {
          'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(user))
      res.end()
    }
  }
}
