module.exports = function setup_auth(server) {
  var modules = ['update', 'sessions', 'register', 'user']

  return modules.reduce(function(auth, name) {
    auth[name] = require('./' + name)

    if(auth[name].setup) {
      auth[name].setup(server)
    }

    return auth
  }, {})
}
