module.exports = guard

function guard(fn, onError) {
  return function(err) {
    if(err) {
      return onError(err)
    }

    try {
      return fn.apply(this, [].slice.call(arguments, 1))
    } catch(err) {
      return onError(err)
    }
  }
}
