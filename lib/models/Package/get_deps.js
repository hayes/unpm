module.exports = get_deps

var a_version = /^[!*~|.\d +<>=()]|latest$/

function get_deps(deps, cache, done) {
  if(!deps || !Object.keys(deps).length) {
    return done(null, cache)
  }

  var remaining = Object.keys(deps)
    , self = this

  // apparently requesting all deps simultainiously
  // results in too many open requests :(
  get(remaining.pop())

  function get(name) {
    if(!deps[name].match(a_version)) {
      if(!remaining.length) {
        return done(null, cache)
      }

      return get(remaining.pop())
    }

    self.clone_module(name, deps[name], true, cache, function(err) {
      if(err) {
        return done(err)
      }

      if(!remaining.length) {
        return done(null, cache)
      }

      get(remaining.pop())
    })
  }
}
