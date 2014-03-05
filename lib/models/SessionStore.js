var crypto = require('crypto')

module.exports = create_session_store

function create_session_store() {
  var sessions = {}

  return {set: set, get: get}

  function set(data, done) {
    var token = create_token()

    sessions[token] = data
    done(null, token)
  }

  function get(token, done) {
    done(null, sessions[token])
  }
}

function create_token() {
  return crypto.randomBytes(30).toString('hex')
}
