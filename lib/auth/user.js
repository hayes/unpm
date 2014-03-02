module.exports = user

function user(app) {
  return function get_user(req, res, params) {
    var username = params.$1

    if(!username) {
      return app.responses.not_found(req, res)
    }

    app.models.User.find(username, function(err, user) {
      if(err) {
        return app.responses.error(req, res, err)
      }

      app.responses.ok(req, res, user)
    })
  }
}
