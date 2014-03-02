module.exports = function setup_auth(server) {
  return {
      get_tarball: require('./get_tarball')(server)
    , get_package: require('./get_package')(server)
    , publish: require('./publish')(server)
    , clone: require('./clone')(server)
  }
}
