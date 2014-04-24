var Package = require('../models/Package')

module.exports = get_tarball

function get_tarball(context, route) {
  var version = route.splats[1]
    , name = route.splats[0]

  Package.getTarball(name, version)
    .on('error', function(err) {
      context.log.error(err)
    })
    .pipe(context.res)
}
