var middleware = require('../lib/middleware')
var test = require('tape')

test('passes context and chains methods', function(t) {
  var _respond = {}
  var _route = {}
  var _unpm = {}
  var count = 0

  t.plan(10)

  middleware([first, second], _respond, _route, _unpm, done)

  function first(respond, route, unpm, next) {
    t.strictEqual(respond, _respond)
    t.strictEqual(route, _route)
    t.strictEqual(unpm, _unpm)
    t.strictEqual(count++, 0)
    next()
  }

  function second(respond, route, unpm, next) {
    t.strictEqual(respond, _respond)
    t.strictEqual(route, _route)
    t.strictEqual(unpm, _unpm)
    t.strictEqual(count++, 1)
    next()
  }

  function done(err) {
    t.ok(!err)
    t.strictEqual(count, 2)
    t.end()
  }
})

test('passes error', function(t) {
  var _respond = {}
  var _route = {}
  var _unpm = {}
  var error = {}
  var count = 0

  t.plan(10)

  middleware([first, second], _respond, _route, _unpm, done)

  function first(respond, route, unpm, next) {
    t.strictEqual(respond, _respond)
    t.strictEqual(route, _route)
    t.strictEqual(unpm, _unpm)
    t.strictEqual(count++, 0)
    next()
  }

  function second(respond, route, unpm, next) {
    t.strictEqual(respond, _respond)
    t.strictEqual(route, _route)
    t.strictEqual(unpm, _unpm)
    t.strictEqual(count++, 1)
    next(error)
  }

  function done(err) {
    t.strictEqual(err, error)
    t.strictEqual(count, 2)
    t.end()
  }
})

test('exit early on error', function(t) {
  var _respond = {}
  var _route = {}
  var _unpm = {}
  var error = {}
  var count = 0

  t.plan(6)

  middleware([first, second], _respond, _route, _unpm, done)

  function first(respond, route, unpm, next) {
    t.strictEqual(respond, _respond)
    t.strictEqual(route, _route)
    t.strictEqual(unpm, _unpm)
    t.strictEqual(count++, 0)
    next(error)
  }

  function second(respond, route, unpm, next) {
    t.ok(false)
  }

  function done(err) {
    t.strictEqual(err, error)
    t.strictEqual(count, 1)
    t.end()
  }
})
