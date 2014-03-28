var Package = require('../../models/Package')
  , responses = require('../../responses')
  , guard = require('../../utils/guard')
  , load = require('../../utils/load')

module.exports = publish

function publish(req, res, route, respond) {
  var data = []
    , version

  load(guard(get_versions, respond))

  function get_versions(meta) {
    var latest = meta['dist-tags'].latest

    Package.get_versions(meta.name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return responses.conflict(req, res)
      }

      Package.publish(meta, created)
    })
  }

  function created(err, data) {
    respond(err, 201, data)
  }
}
