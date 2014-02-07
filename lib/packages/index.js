module.exports = function setup_auth(server) {
  var modules = ['publish', 'get_tarball', 'get_package', 'clone']

  return modules.reduce(function(packages, name) {
    packages[name] = require('./' + name)

    if(packages[name].setup) {
      packages[name].setup(server)
    }

    return packages
  }, {})
}
