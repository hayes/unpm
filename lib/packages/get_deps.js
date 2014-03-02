module.exports = get_deps

function get_deps(app, req, res, name, version) {
  var Package = app.models.Package
    , backend = app.backend

  backend.backend.get_meta(name, version || 'latest', got_meta)

  function got_meta(err, meta) {
    if(err) {
      return app.responses.error(req, res, err)
    }

    if(!meta) {
      return app.responses.not_found(req, res)
    }

    Package.get_deps(meta, {}, true, function(err, data) {
      if(err) {
        return app.responses.error(req, res, err)
      }

      app.responses.created(req, res, Object.keys(data))
    })
  }
}
