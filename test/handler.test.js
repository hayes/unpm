var get_context = require('../lib/context')
  , handler = require('../lib/handler')
  , log = require('../lib/logging')({})
  , concat = require('concat-stream')
  , Router = require('unpm-router')
  , setup = require('./setup')
  , http = require('http')

var test = setup(before, after, start)

var route_options = {
    port: 8910
  , method: 'GET'
  , path: '/test/path'
  , host: 'localhost'
}

function before(context) {
  context.log = log
  context.router = Router()
}

function start(context) {
  context.server = http.createServer(handler)
  context.server.listen(8910)
}

function after(context) {
  context.server.close()
}

test('req and resp saved', req_and_resp_saved)
test('not found and 500 works', errors_work_as_expected)
test('handler calls middleware', test_middleware)

function req_and_resp_saved(t) {
  var context = get_context()
    , router = context.router

  t.plan(5)

  router.add('GET', route_options.path, arbitrary_handler)

  function arbitrary_handler(ctx, route, respond) {
    var context = get_context()

    t.equal(ctx.req, context.req)
    t.equal(ctx.res, context.res)
    t.equal(route, context.route)
    t.equal(route.route, route_options.path)

    respond(null, 200, {arbitrary: 'data'})
  }

  var req = http.request(route_options, function(req) {
    req.pipe(concat(check_response))

    function check_response(data) {
      t.equal(data.toString(), '{"arbitrary":"data"}')
      t.end()
    }
  })

  req.write('hi')
  req.end()
}

function errors_work_as_expected(t) {
  var context = get_context()
    , router = context.router

  t.plan(2)

  var req = http.request(route_options, function(res) {
    t.strictEqual(res.statusCode, 404)
    next_request()
  })

  req.write('hi')
  req.end()

  function next_request() {
    router.add('GET', route_options.path, handler_500)

    var req = http.request(route_options, function(res) {
      t.strictEqual(res.statusCode, 500)
      t.end()
    })

    req.write('hi')
    req.end()
  }

  function handler_500(context, route, respond) {
    respond(new Error('woo!'))
  }
}

function test_middleware(t) {
  var context = get_context()
    , router = context.router
    , special = {}

  t.plan(2)

  context.middleware = [add_special]

  router.add('GET', route_options.path, arbitrary_handler)

  function arbitrary_handler(context, route, respond) {
    t.strictEqual(special, get_context().special)
    respond(null, 200, {arbitrary: 'data'})
  }

  function add_special(context, done) {
    context.special = special
    done()
  }

  var req = http.request(route_options, function(res) {
    t.equal(res.statusCode, 200)
    t.end()
  })

  req.write('hi')
  req.end()
}
