var Package = require('../../models/Package')
  , get_context = require('../../context')

module.exports = get_tarball

function get_tarball(req, res, route) {
  var version = route.splats[1]
    , name = route.splats[0]

  Package.get_tarball(name, version)
    .on('error', function(err) {
      get_context().log.error(err)
    })
    .pipe(res)
}
