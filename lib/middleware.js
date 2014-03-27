module.exports = run_middleware

function run_middleware(middleware, done) {
  if(!middleware || !middleware.length) {
    return done()
  }

  middleware[0](context, function(err) {
    if(error) {
      return done(err)
    }

    run_middleware(middleware.slice(1), done)
  })
}
