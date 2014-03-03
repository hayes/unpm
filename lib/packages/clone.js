module.exports = clone

function clone(app, req, res) {
  var Package = app.models.Package
    , version = req.params.version
    , name = req.params.name

  Package.clone(name, version, req.query.recursive, function(err, data) {
    if(err) {
      return app.responses.error(req, res, err)
    }

    app.responses.created(req, res, Object.keys(data))
  })
}

function noop() {}
