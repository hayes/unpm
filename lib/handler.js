module.exports = init

function init(app) {
  return handler

  function handler(req, res) {
    var action = app.router.match(req)

    res.on('finish', function() {
      app.log.http(res.statusCode, req.url)
    })

    if(!action) {
      return app.responses.not_found(req, res)
    }

    req.params = action.params
    req.splats = action.splats
    req.route = action.route
    req.query = action.query

    action.fn(app, req, res)
  }
}
