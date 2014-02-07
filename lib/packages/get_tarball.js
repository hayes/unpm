module.exports = get_tarball

function get_tarball(app, req, res, name, version) {
  app.models.Package.get_tarball(name, version).pipe(res)
}
