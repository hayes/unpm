var clone_module = require('./clone_module')

module.exports = get_deps

function get_deps(deps, cache, done) {
  if(!deps || !Object.keys(deps).length) {
    return done(null, cache)
  }

  var remaining = Object.keys(deps)

  // apparently requesting all deps simultainiously
  // results in too many open requests :(
  get_dep(remaining.pop())

  function get_dep(name) {
    if(!deps[name].match(a_version)) {
      if(!remaining.length) {
        return done(null, cache)
      }

      return get_dep(remaining.pop())
    }

    clone_module(name, deps[name], true, cache, function(err) {
      if(err) {
        return done(err)
      }

      if(!remaining.length) {
        return done(null, cache)
      }

      get_dep(remaining.pop())
    })
  }
}
