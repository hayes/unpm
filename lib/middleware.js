module.exports = runMiddleware

function runMiddleware(middleware, respond, route, unpm, done) {
  if(!middleware || !middleware.length) {
    return done()
  }

  middleware[0](respond, route, unpm, function(err) {
    if(err) {
      return done(err)
    }

    runMiddleware(middleware.slice(1), respond, route, unpm, done)
  })
}
