var Package = require('../models/Package')
  , request = require('request')

module.exports = get_tarball

function get_tarball(context, route, respond) {
  var version = route.params.version
    , name = route.params.name
    , started = false

  var tarball_stream = Package.getTarball(name, version)

  tarball_stream.on('error', function(err) {
    if(started) {
      return context.log.error(err)
    }

    if(err.code === 'ENOTFOUND' || err.code === 'ENOENT' || err.notFound) {
      return not_found()
    }

    respond.on_error()
  })

  tarball_stream.once('data', function(data) {
    started = true
    tarball_stream.pipe(context.res).write(data)
  })

  function not_found() {
    return respond.not_found()
  }
}
