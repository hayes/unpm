var init_user = require('../../lib/models/User')
  , config = require('../../lib/config.json')
  , backend = require('../backend')
  , test = require('..')

config.backend = backend

test('can init User', function(t) {
  var User = init_user(config)

  t.plan(5)
  setTimeout(function() {
    t.ok(User, 'returns an object')
    t.equal(typeof User.find, 'function', 'User has a find method')
    t.equal(typeof User.create, 'function', 'User has a create method')
    t.equal(typeof User.update, 'function', 'User has a update method')
    t.equal(typeof User.auth, 'function', 'User has a auth method')
    t.end()
  }, 500)
})
