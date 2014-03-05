var Package = require('../../models/Package')

module.exports = get_tarball

function get_tarball(req, res, route) {
  var version = route.splats[1]
    , name = route.splats[0]

  Package.get_tarball(name, version).pipe(res)
}
