module.exports = function setup_auth(server) {
  return {
      create_session: require('./sessions')(server)
    , register: require('./register')(server)
    , update: require('./update')(server)
    , user: require('./user')(server)
  }
}
