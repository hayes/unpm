var Package = require('../models/Package')
  , load = require('../utils/load')

module.exports.all = remove_all
module.exports.some = remove_some
module.exports.tarball = remove_tarball

function remove_all(context, route, respond) {
  var name = route.params.name

  Package.remove(name, function(err, data) {  
    if(err) {
      return respond(err)
    }

    respond(null, 200, data)
  })
}

function remove_some(context, route, respond) {
  var name = route.params.name

  load(context.req, function(err, data) {
    if(err) {
      return respond(err)
    }

    Package.getVersions(name, compare)

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
      return respond.not_found()
    }

    var remaining = versions.length
      , returned = false

    versions.forEach(function(version) {
      Package.removeVersion(name, version, done)
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

function remove_tarball(context, route, respond) {
  respond(null, 200, {ok: 'file removed'})
}
