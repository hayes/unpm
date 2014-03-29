var concat = require('concat-stream')
  , context = require('../context')

module.exports = load

function load(req, done) {
  var stream = concat(context.ns.bind(function(data) {
    try {
      data = JSON.parse(data.toString())
      done(null, data)
    } catch(err) {
      done(err)
    }
  }))

  req.pipe(stream)
  stream.on('error', done)
}
