module.exports = get_deps

var a_version = /^[!*~|.\d +<>=()]|latest$/
  , is_dep = /dependencies/i

function get_deps(package, cache, all, done) {
  if(!done) {
    done = all
    all = false
  }

  var deps = discover_deps(package, all)

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

    self.clone(name, deps[name], true, cache, function(err) {
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

function discover_deps(package, all) {
  var keys = Object.keys(package).filter(function(key) {
    return all ? is_dep.test(key) : key === 'dependencies'
  })

  return keys.reduce(add_deps, {})

  function add_deps(deps, key) {
    Object.keys(package[key]).forEach(function(name) {
      deps[name] = package[key][name]
    })

    return deps
  }
}
