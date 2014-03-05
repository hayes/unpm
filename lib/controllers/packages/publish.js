var Package = require('../../models/Package')
  , responses = require('../../responses')

var unpm = CLS.getNamespace('unpm')

module.exports = publish

function publish(req, res, route, respond) {
  var data = []
    , version

  var load = concat(function(data) {
    try {
      get_version(JSON.parse(data))
    } catch(err) {
      respond(err)
    }
  })

  load.on('error', respond)
  req.pipe(load)

  function get_versions(meta) {
    var latest = meta['dist-tags'].latest
      , config = unpm.get('config')

    Package.get_versions(meta.name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return responses.conflict(req, res)
      }

      Package.publish(meta, config.auto_clone_deps ? clone_deps : created)
    })
  }

  function clone_deps(err, data) {
    if(err || !data) {
      return respond(err || new Error('Package or version not found.'))
    }

    Package.get_deps(
        data.versions[data['dist-tags'].latest]
      , {}
      , true
      , created
    )
  }

  function created(err, data) {
    respond(err, 201, data)
  }
}
