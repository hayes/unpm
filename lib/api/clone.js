var clone_module = require('../utils/clone_module')
  , on_error = require('./500')

module.exports = clone

function clone(req, res, name, version) {
  clone_module(name, version, req.query.recursive, function(err, data) {
    if(err) {
      return on_error(req, res, err)
    }

    res.writeHead(201, {
        'Content-Type': 'application/json'
    })
    res.write(JSON.stringify(Object.keys(data)))
    res.end()
  })
}

function noop() {}
