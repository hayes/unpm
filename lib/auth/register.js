var concat = require('concat-stream')

module.exports = req_handler

function req_handler(app, req, res) {
  var conflict = app.responses.conflict
    , created = app.responses.created
    , on_error = app.responses.error
    , User = app.models.User

  var username = req.splats[0]

  req.pipe(concat(function(data) {
    try {
      register(username, JSON.parse(data.toString()))
    } catch(err) {
      on_error(req, res, err)
    }
  })).on('error', function(err) {
    on_error(req, res, err)
  })

  function register(username, data) {
    User.find(username, function(err, user) {
      if(user) {
        return conflict(req, res)
      }

      User.create(username, data, function(err) {
        if(err) {
          return on_error(req, res, err)
        }

        created(req, res, data)
      })
    })
  }
}
