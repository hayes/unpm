var cidrCheck = require('range_check')

module.exports = setup

function setup(unpm) {
  if(unpm.config.cidr) {
    unpm.middleware.push(check)
  }

  function check(respond, route, unpm, done) {
    var allowed =  cidrCheck.in_range(
      respond.req.connection.remoteAddress,
      unpm.config.cidr
    )

    if(allowed) {
      return done()
    }

    respond.res.writeHead(403, {
      'Content-Type': 'application/json'
    })

    respond.res.end(JSON.stringify({
      error: 'forbidden',
      reason: 'invalid ip'
    }))
  }
}
