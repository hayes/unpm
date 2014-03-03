module.exports = get_user

function get_user(app, req, res) {
  var username = req.splats[0]

  app.models.User.find(username, function(err, user) {
    if(err) {
      return app.responses.error(req, res, err)
    }

    if(!username) {
      return app.responses.not_found(req, res)
    }

    app.responses.ok(req, res, user)
  })
}
