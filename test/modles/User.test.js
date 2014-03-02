var init_user = require('../../lib/models/User')
  , config = require('../../lib/config.json')
  , hash = require('password-hash')
  , backend = require('../backend')
  , crypto = require('crypto')
  , test = require('../index')

test('can init User', function(t) {
  config.backend = backend()

  var User = init_user(config)

  t.ok(User, 'returns an object')
  t.equal(typeof User.find, 'function', 'User has a find method')
  t.equal(typeof User.create, 'function', 'User has a create method')
  t.equal(typeof User.update, 'function', 'User has an update method')
  t.equal(typeof User.auth, 'function', 'User has an auth method')
  t.end()
})

test('create user', function(t) {
  config.backend = backend()

  var User = init_user(config)
    , user_data = {}

  user_data.password_sha = 'hunter2'
  user_data.date = '2014-01-01'

  t.plan(4)

  User.create('ZeroCool', user_data, function(err) {
    t.ok(!err, 'no error')
  })

  User.create(null, user_data, function(err) {
    t.ok(err, 'requires username')
  })

  User.create('ZeroCool', {date: 'foo'}, function(err) {
    t.ok(err, 'requires password')
  })

  User.create('ZeroCool', {password_sha: 'foo'}, function(err) {
    t.ok(err, 'requires date')
  })
})

test('find_user', function(t) {
  var User = init_user(config)

  var data = {
      name: 'ZeroCool'
    , email: 'me@example.com'
    , salt: 'saltine'
    , date: '2014-01-01'
    , password_sha: sha('hunter2saltine')
  }

  var USER

  t.plan(9)

  User.create(data.name, data, function(err) {
    t.ok(!err, 'create user to find')

    User.find(data.name, function(err, user) {
      t.ok(!err, 'no error')
      t.equal(user.name, data.name, 'gets name')
      t.equal(user.email, data.email, 'gets email')
      t.equal(user.date, data.date, 'gets date')
      t.ok('_rev', 'gets _rev')
      t.equal(Object.keys(user).length, 4, 'nothing else')
    })

    User.find('other guy', function(err, user) {
      t.ok(err, 'error when not found')
      t.ok(!user, 'no user for other guy')
    })
  })
})

function sha(s) {
  return crypto.createHash('sha1').update(s).digest('hex')
}
