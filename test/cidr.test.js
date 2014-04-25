var setup = require('../lib/cidr')
  , test = require('tape')

var req = {}

req.connection = {
    remoteAddress: '127.0.0.1'
}

test('adds middleware', function(t) {
  var unpm = {config: {}, middleware: []}

  t.plan(2)
  setup(unpm)
  t.ok(!unpm.middleware.length)

  unpm.config.cidr = ['127.0.0.0/8']
  setup(unpm)
  t.ok(unpm.middleware.length, 1)
})

test('allows valid ips', function(t) {
  var unpm = {middleware: []}
    , check

  unpm.config = {
      cidr: ['127.0.0.0/8']
  }

  t.plan(1)
  setup(unpm)
  check = unpm.middleware[0]

  check({req: req}, function() {
    t.ok(true)
  })
})

test('blocks invalid ips', function(t) {
  var unpm = {middleware: []}
    , res = {}
    , check

  res.writeHead = write
  res.end = end

  unpm.config = {
      cidr: ['10.0.0.0/8']
  }

  t.plan(3)
  setup(unpm)
  check = unpm.middleware[0]

  check({req: req, res: res}, function() {
    t.ok(false)
  })

  function write(status, headers) {
    t.equal(status, 403)
    t.deepEqual(headers, {
        'Content-Type': 'application/json'
    })
  }

  function end(body) {
    t.equal(body, JSON.stringify({
        error: 'forbidden'
      , reason: 'invalid ip'
    }))
    t.end()
  }
})

test('allows if any range matches', function(t) {
  var unpm = {middleware: []}
    , check

  unpm.config = {
      cidr: ['10.0.0.0/8', '127.0.0.0/8']
  }

  t.plan(1)
  setup(unpm)
  check = unpm.middleware[0]

  check({req: req}, function() {
    t.ok(true)
  })
})
