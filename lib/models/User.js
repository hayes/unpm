var hash = require('password-hash')
  , crypto = require('crypto')

module.exports = setup

function setup(config) {
  var backend = config.backend

  return {
      find: find_user
    , create: create
    , update: update
    , auth: auth
  }

  function find_user(username, done) {
    find(username, function(err, user) {
      if(err || !user) {
        return done(err)
      }

      done(null, clean_user(user))
    })
  }

  function find(username, done) {
    backend.get_user(username, function(err, data) {
      try {
        done(err, data ? JSON.parse(data) : null)
      } catch(err) {
        done(err)
      }
    })
  }

  function auth(username, password, done) {
    find(username, function(err, user) {
      var invalid = new Error('Name or password is incorrect.')

      if(err || !user) {
        return done(invalid)
      }

      if(!hash.verify(sha(password + user.salt), user.password_hash)) {
        return done(invalid)
      }

      done(null, clean_user(user))
    })
  }

  function create(username, data, done) {
    try {
      backend.set_user(
          username
        , JSON.stringify(build_user(username, data, 1))
        , done
      )
    } catch(err) {
      done(err)
    }
  }

  function update(old, updated, done) {
    try {
      var v = +old._rev.split('-')[0] + 1

      backend.set_user(
          old.name
        , JSON.stringify(build_user(updated.name, updated, v))
        , on_updated
      )
    } catch(err) {
      done(err)
    }

    function on_updated(err) {
      if(err) {
        return done(err)
      }

      done(null, clean_user(updated))
    }
  }

  function build_user(username, data, v) {
    var user = {}

    user.name = username
    user.email = data.email
    user.salt = data.salt
    user.date = data.date
    user.password_hash = hash_pass(data.password_sha)
    // not sure what this is actaully for, or supposed to be
    // (I guess I should learn couch?)
    user._rev = v + '-' + md5(data.date)

    return user
  }

  function clean_user(raw_user) {
    var user = {}

    user.name = raw_user.name
    user.email = raw_user.email
    user.date = raw_user.date
    user._rev = raw_user._rev

    return user
  }

  function md5(s) {
    return crypto.createHash('md5').update(s).digest('hex')
  }

  function sha(s) {
    return crypto.createHash('sha1').update(s).digest('hex')
  }

  function hash_pass(s, settings) {
    settings = settings || config.crypto

    return hash.generate(s, settings)
  }
}
