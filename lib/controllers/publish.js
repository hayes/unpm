var guard = require('../utils/guard')
var load = require('../utils/load')

module.exports = publish

function publish(respond, route, unpm) {
  var data = []
  var version

  load(respond.req, guard(getVersions, respond))

  function getVersions(meta) {
    var latest = meta['dist-tags'].latest

    unpm.Package.getVersions(meta.name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return respond.conflict()
      }

      unpm.Package.publish(meta, created)
    })

    function created(err, data) {
      if (err) {
        unpm.log.error({action: 'publish', err: err, name: meta.name})
      }

      respond(err, 201, data)
    }
  }
}
