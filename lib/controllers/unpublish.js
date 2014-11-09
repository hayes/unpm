var load = require('../utils/load')

module.exports.all = removeAll
module.exports.some = removeSome
module.exports.tarball = removeTarball

function removeAll(respond, route, unpm) {
  var name = route.params.name

  unpm.Package.remove(name, function(err, data) {
    if(err) {
      return respond(err)
    }

    respond(null, 200, data)
  })
}

function removeSome(respond, route, unpm) {
  var name = route.params.name

  load(respond.req, function(err, data) {
    if(err) {
      return respond(err)
    }

    unpm.Package.getVersions(name, compare)

    function compare(err, versions) {
      if(err) {
        return respond(err)
      }

      remove(versions.map(missing).filter(Boolean))
    }

    function missing(version) {
      return !data.versions[version] && version
    }
  })

  function remove(versions) {
    if(!versions.length) {
      return respond.notFound()
    }

    var remaining = versions.length
    var returned = false

    versions.forEach(function(version) {
      unpm.Package.removeVersion(name, version, done)
    })

    function done(err, data) {
      if(returned) {
        return
      }

      if(err) {
        returned = true

        return respond(err)
      }

      if(!--remaining) {
        returned = true
        respond(null, 200, {ok: 'updated package'})
      }
    }
  }
}

function removeTarball(respond, route, unpm) {
  respond(null, 200, {ok: 'file removed'})
}
