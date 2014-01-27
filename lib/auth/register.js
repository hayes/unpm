var concat = require('concat-stream')
  , on_error = require('../api/500')
  , conflict = require('../api/409')
  , Users = require('./user-store')

module.exports = req_handler

function req_handler(req, res, username) {
  req.pipe(concat(function(data) {
    try {
      register(username, JSON.parse(data.toString()))
    } catch(err) {
      on_error(req, res, err)
    }
  })).on('error', function(err) {
    on_error(req, res, err)
  })

  function respond(err, status, data) {
    if(err) {
      return on_error(req, res, err)
    }

    res.writeHead(status, {
        'Content-Type': 'application/json'
    })
    res.write(JSON.stringify(data))
    res.end()
  }

  function register(username, data) {
    Users.find(username, function(err, user) {
      if(user) {
        return conflict(req, res)
      }

      Users.create(username, data, function(err) {
        respond(err, 201, data)
      })
    })
  }
}
