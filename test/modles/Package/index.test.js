var CLS = require('continuation-local-storage')
  , unpm = CLS.createNamespace('unpm')

var Package = require('../../../lib/models/Package')
  , config = require('../../../lib/config.json')
  , backend = require('../../backend')
  , test = require('tape')

function setup(test) {
  return function(t) {
    unpm.run(function() {
      unpm.set('config', config)
      unpm.set('backend', backend())
      test(t)
    })
  }
}

test('Package.set_meta', setup(function(t) {
  var data = {
    foo: 'bar'
  }

  t.plan(1)

  Package.set_meta('unpm', data, function(err) {
    t.ok(!err, 'no error when setting meta')
  })
}))
