module.exports = guard

function guard(fn, on_error) {
  return function(err) {
    if(err) {
      return on_error(err)
    }

    try {
      return fn.apply(this, [].slice.call(arguments, 1))
    } catch(err) {
      return on_error(err)
    }
  }
}
