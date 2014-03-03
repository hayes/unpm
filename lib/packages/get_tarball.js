module.exports = get_tarball

function get_tarball(app, req, res) {
  var version = req.params.version
    , name = req.params.name

  app.models.Package.get_tarball(name, version).pipe(res)
}
