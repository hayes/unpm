var guard = require('../utils/guard')

module.exports = publish

function publish(app, req, res, name) {
  var conflict = app.responses.conflict
    , created = app.responses.created
    , on_error = app.responses.error
    , Package = app.models.Package

  var data = []

  req.on('data', function(d) {
    data.push(d)
  }).on('err', function(err) {
    on_error(req, res, err)
  }).on('end', function() {
    guard(get_versions, respond)(Buffer.concat(data).toString())
  })

  function get_versions(data) {
    var meta = JSON.parse(data)
      , name = meta.name
      , latest

    latest = meta['dist-tags'].latest
    Package.get_versions(name, function(err, versions) {
      if(versions && versions.indexOf(latest) !== -1) {
        return conflict(req, res)
      }

      Package.publish(meta, app.auto_clone_deps ? clone_deps : respond)
    })
  }

  function clone_deps(err, data) {
    if(err || !data) {
      return on_error(req, res, err || new Error)
    }

    Package.get_deps(
        data.versions[data['dist-tags'].latest]
      , {}
      , true
      , respond
    )
  }

  function respond(err, data) {
    if(err) {
      return on_error(req, res, err)
    }

    created(req, res, data)
  }
}
