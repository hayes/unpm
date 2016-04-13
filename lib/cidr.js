var cidrCheck = require('range_check')

module.exports = setup

function setup(unpm) {
  if(unpm.config.cidr) {
    unpm.middleware.push(check)
  }

  function check(respond, route, unpm, done) {
    var ip = respond.req.connection.remoteAddress
    var allowed =  cidrCheck.in_range(ip, unpm.config.cidr)

    if(allowed) {
      return done()
    }

    unpm.log.info({ip: ip, message: 'IP out of CIDR range'})

    respond.res.writeHead(403, {
      'Content-Type': 'application/json'
    })

    respond.res.end(JSON.stringify({
      error: 'forbidden',
      reason: 'invalid ip'
    }))
  }
}
