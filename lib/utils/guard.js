module.exports = guard

function guard(fn, done) {
  return function() {
    try {
      fn.apply(null, [].slice.call(arguments))
    } catch(err) {
      done(err)
    }
  }
}
