var backend = require('unpm-mem-backend')
var Package = require('../../lib/models/Package')({backend: backend()})
var concat = require('concat-stream')
var test = require('tape')

test('get and set meta', function(t) {
  var data = {
      foo: 'bar'
  }

  t.plan(3)

  Package.setMeta('unpm', data, function(err) {
    t.ok(!err, 'no error when setting meta')
    Package.getMeta('unpm', got_meta)
  })

  function got_meta(err, result) {
    t.ok(!err, 'no error when getting meta')
    t.deepEqual(result, data, 'returned data matches set data')
  }
})

test('get and set tarball', function(t) {
  var stream = Package.setTarball('unpm', '1.2.3')
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
    var result = Package.getTarball('unpm', '1.2.3').pipe(concat(done))

    result.on('error', function() {
      t.ok(false, 'no error when getting tarball')
    })

    function done(data) {
      t.equal(data, val, 'tarball should equal set value')
    }
  }
})
