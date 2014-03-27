var middleware = require('../lib/middleware')
  , test = require('tape')

test('passes context and chains methods', function(t) {
  var context = {}
    , count = 0

  t.plan(6)

  middleware(context, [first, second], done)

  function first(ctx, next) {
    t.strictEqual(ctx, context)
    t.strictEqual(count++, 0)
    next()
  }

  function second(ctx, next) {
    t.strictEqual(ctx, context)
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
  var context = {}
    , error = {}
    , count = 0

  t.plan(6)

  middleware(context, [first, second], done)

  function first(ctx, next) {
    t.strictEqual(ctx, context)
    t.strictEqual(count++, 0)
    next()
  }

  function second(ctx, next) {
    t.strictEqual(ctx, context)
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
  var context = {}
    , error = {}
    , count = 0

  t.plan(4)

  middleware(context, [first, second], done)

  function first(ctx, next) {
    t.strictEqual(ctx, context)
    t.strictEqual(count++, 0)
    next(error)
  }

  function second(ctx, next) {
    t.ok(false)
  }

  function done(err) {
    t.strictEqual(err, error)
    t.strictEqual(count, 1)
    t.end()
  }
})
