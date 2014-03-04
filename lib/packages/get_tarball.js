module.exports = get_tarball

function get_tarball(app, req, res) {
  var version = req.splats[1]
    , name = req.splats[0]

  app.models.Package.get_tarball(name, version).pipe(res)
}
