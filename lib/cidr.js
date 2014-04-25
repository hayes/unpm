var test = require('range_check')

module.exports = setup

function setup(unpm) {
  if(unpm.config.cidr) {
    unpm.middleware.push(check)
  }

  function check(ctx, done) {
    var allowed =  test.in_range(
        ctx.req.connection.remoteAddress
      , unpm.config.cidr
    )

    if(allowed) {
      return done()
    }

    ctx.res.writeHead(403, {
        'Content-Type': 'application/json'
    })

    ctx.res.end(JSON.stringify({
        error: 'forbidden'
      , reason: 'invalid ip'
    }))
  }
}
