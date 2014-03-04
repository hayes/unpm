module.exports = function setup_auth(server) {
  var modules = [
      'get_package'
    , 'get_tarball'
    , 'get_deps'
    , 'publish'
    , 'clone'
  ]

  return modules.reduce(function(packages, name) {
    packages[name] = require('./' + name)

    if(packages[name].setup) {
      packages[name].setup(server)
    }

    return packages
  }, {})
}
