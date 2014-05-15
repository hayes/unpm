var Package = require('../models/Package')

module.exports = get_tarball

function get_tarball(context, route, respond) {
  var version = route.splats[1]
    , name = route.splats[0]
    , started = false

  var tarball_stream = Package.getTarball(name, version)

  tarball_stream.on('error', function(err) {
    if(started) {
      return context.log.error(err)
    }

    if(err.code === 'ENOTFOUND' || err.notFound) {
      return not_found()
    }

    respond.on_error()
  })

  tarball_stream.once('data', function(data) {
    started = true
    tarball_stream.pipe(context.res).write(data)
  })

  function not_found() {
    if(!context.config.fallback) {
      return respond.not_found()
    }

    request(context.config.fallback + context.route.path).pipe(context.res)
  }
}
