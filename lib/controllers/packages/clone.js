var Package = require('../../models/Package')

module.exports = clone

function clone(req, res, route, respond) {
  var version = route.params.version
    , name = route.params.name

  Package.clone(name, version, req.query.recursive, function(err, data) {
    if(err) {
      return respond(err)
    }

    respond(null, 201, Object.keys(data))
  })
}
