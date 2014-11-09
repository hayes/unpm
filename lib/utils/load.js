var concat = require('concat-stream')

module.exports = load

function load(req, done) {
  var stream = concat(function(data) {
    try {
      data = JSON.parse(data.toString())
      done(null, data)
    } catch(err) {
      done(err)
    }
  })

  req.pipe(stream)
  stream.on('error', done)
}
