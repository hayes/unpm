var Package = require('../../../lib/models/Package')
  , get_context = require('../../../lib/context')
  , config = require('../../../lib/config.json')
  , backend = require('../../backend')
  , concat = require('concat-stream')
  , test = require('tape')

function setup(test) {
  return function(t) {
    get_context.ns.run(function(context) {
      context.config = config
      context.backend = backend()
      test(t)
    })
  }
}

test('get and set meta', setup(function(t) {
  var data = {
      foo: 'bar'
  }

  t.plan(3)

  Package.set_meta('unpm', data, function(err) {
    t.ok(!err, 'no error when setting meta')
    Package.get_meta('unpm', got_meta)
  })

  function got_meta(err, result) {
    t.ok(!err, 'no error when getting meta')
    t.deepEqual(result, data, 'returned data matches set data')
  }
}))

test('get and set tarball', setup(function(t) {
  var stream = Package.set_tarball('unpm', '1.2.3')
    , val = 'abc'

  stream.on('end', function() {
    t.ok(true, 'no error when setting tarball')
    get_tarball()
  })
  stream.on('error', function(err) {
    t.ok(false, 'no error when setting tarball')
  })

  t.plan(2)
  stream.write(val)
  stream.end()

  function get_tarball() {
    var result = Package.get_tarball('unpm', '1.2.3').pipe(concat(done))

    result.on('error', function() {
      t.ok(false, 'no error when getting tarball')
    })

    function done(data) {
      t.equal(data, val, 'tarball should equal set value')
    }
  }
}))
