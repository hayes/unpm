var Package = require('../models/Package')
  , guard = require('../utils/guard')
  , load = require('../utils/load')

module.exports = publish

function publish(context, route, respond) {
  var data = []
    , version

  load(context.req, guard(get_versions, respond))

  function get_versions(meta) {
    var latest = meta['dist-tags'].latest

    Package.getVersions(meta.name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return respond.conflict()
      }

      Package.publish(meta, created)
    })
  }

  function created(err, data) {
    respond(err, 201, data)
  }
}
