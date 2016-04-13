var unpm = require('../index')
var cidr = require('../lib/cidr')
var test = require('tape')

var req = {}

req.connection = {
  remoteAddress: '127.0.0.1'
}

test('adds middleware', function(t) {
  var config = {checkAuth: false}
  var instance = unpm(config)

  t.plan(2)

  t.ok(!instance.middleware.length)

  config.cidr = ['127.0.0.0/8']
  instance = unpm(config)
  t.ok(instance.middleware.length, 1)
})

test('allows valid ips', function(t) {
  var instance = unpm({
    cidr: ['127.0.0.0/8'],
    checkAuth: false
  })
  var check = instance.middleware[0]

  t.plan(1)
  check({req: req}, null, instance, function() {
    t.ok(true)
  })
})

test('blocks invalid ips', function(t) {
  var res = {writeHead: write, end: end}
  var instance = unpm({
    cidr: ['10.0.0.0/8'],
    checkAuth: false
  })
  var check = instance.middleware[0]

  t.plan(3)

  check({req: req, res: res}, null, instance, function() {
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
  var instance = unpm({
    cidr: ['10.0.0.0/8', '127.0.0.0/8'],
    checkAuth: false
  })
  var check = instance.middleware[0]

  t.plan(1)

  check({req: req}, null, instance, function() {
    t.ok(true)
  })
})

test('logs when range check fails', function(t) {
  var fakeUnpm = {
    config: {cidr: ['10.0.0.0/8']},
    log: {info: checkLog},
    middleware: []
  }
  var check

  t.plan(3)

  cidr(fakeUnpm)
  check = fakeUnpm.middleware[0]

  check(
    {req: req, res: {writeHead: checkHead, end: noop}},
    null,
    fakeUnpm,
    function() {
      t.fail('middleware should not call back')
    }
  )

  function checkHead(code) {
    t.equal(code, 403)
  }

  function checkLog(info) {
    t.equal(info.ip, req.connection.remoteAddress)
    t.true(info.message.indexOf('CIDR') > -1, 'message mentions CIDR')
  }
})

function noop() {
  // no-op
}
