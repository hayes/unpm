var concat = require('concat-stream')

module.exports = req_handler

function req_handler(app, req, res, username) {
  var unauthorized = app.responses.unauthorized
    , created = app.responses.created
    , on_error = app.responses.error
    , User = app.models.User

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

    User.auth(username, pass, got_user)

    function got_user(err, user) {
      if(err || !user) {
        return unauthorized(req, res)
      }

      User.update(user, data, updated)
    }

    function updated(err, user) {
      if(err || !user) {
        return on_error(req, res, err)
      }

      created(req, res, user)
    }
  }
}
