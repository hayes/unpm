module.exports = get_tarball

function get_tarball(app) {
  return tarball
    
  function tarball(req, res, params) {
    var version = params.$2
      , name = params.$1

    app.models.Package.get_tarball(name, version).pipe(res)
  }
}
