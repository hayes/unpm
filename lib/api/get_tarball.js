var backend = require('../storage')

module.exports = get_tarball

function get_tarball(req, res, name, version) {
  backend.get_package(name, version).pipe(res)
}
