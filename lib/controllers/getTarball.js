module.exports = getTarball

function getTarball(respond, route, unpm) {
  var version = route.params.version
  var name = route.params.name
  var started = false
  var getTarballAsync = unpm.Package.getTarballAsync
  var getTarballSync = unpm.Package.getTarball

  var tarballStream = null

  if (typeof getTarballSync === 'function') {
    // Use synchronous behavior for fetching tarball. We're assuming it's coming from disk
    tarballStream = getTarballSync(name, version)
    doneFnc()
  } else if (typeof getTarball === 'function') {
    // Async handler. Will provide a done function when the tarball is ready
    getTarballAsync(name, version, function (tball) {
      tarballStream = tball
      doneFnc()
    })
  }

  var doneFnc = function () {
    tarballStream.on('error', function(err) {
      if(started) {
        return unpm.log.error(err)
      }

      if(err.code === 'ENOTFOUND' || err.code === 'ENOENT' || err.notFound) {
        return notFound()
      }

      respond.onError()
    })

    tarballStream.once('data', function(data) {
      started = true
      tarballStream.pipe(respond.res).write(data)
    })

    function notFound() {
      return respond.notFound()
    }
  }
}
