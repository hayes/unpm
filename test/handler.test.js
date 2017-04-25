var handler = require('../lib/handler')
var log = require('../lib/logging')({})
var concat = require('concat-stream')
var Router = require('unpm-router')
var http = require('http')
var test = require('tape')

var routeOptions = {
  port: 8910,
  method: 'GET',
  path: '/test/path',
  host: 'localhost'
}

test('req and resp saved', reqAndRespSaved)
test('not found and 500 works', errorsWorkAsExpected)
test('handler calls middleware', testMiddleware)

function reqAndRespSaved(t) {
  t.plan(5)
  var server = setupWith(handler, null, function() {
    var req = http.request(routeOptions, function(req) {
      req.pipe(concat(check))

      function check(data) {
        t.equal(data.toString(), '{"arbitrary":"data"}')
        server.close(function() {
          t.end()
        })
      }
    })

    req.write('hi')
    req.end()
  })

  function handler(respond, route, unpm) {
    t.ok(respond.req)
    t.ok(respond.res)
    t.equal(route.route, '/test/path')
    t.equal(route.route, routeOptions.path)

    respond(null, 200, {arbitrary: 'data'})
  }
}

function errorsWorkAsExpected(t) {
  t.plan(2)

  var server = setupWith(null, null, function() {
    var req = http.request(routeOptions, function(res) {
      t.strictEqual(res.statusCode, 404)
      server.close(nextRequest)
    })

    req.write('hi')
    req.end()
  })

  function nextRequest() {
    var server = setupWith(handler, null, function() {
      var req = http.request(routeOptions, function(res) {
        t.strictEqual(res.statusCode, 500)
        server.close(function() {
          t.end()
        })
      })

      req.write('hi')
      req.end()
    })
  }

  function handler(respond) {
    respond(new Error('woo!'))
  }
}

function testMiddleware(t) {
  var special = {}

  t.plan(2)
  var server = setupWith(handler, [addSpecial], function() {
    var req = http.request(routeOptions, function(res) {
      t.equal(res.statusCode, 200)
      server.close(function() {
        t.end()
      })
    })

    req.write('hi')
    req.end()
  })

  function handler(respond, route, unpm) {
    t.strictEqual(special, unpm.special)
    respond(null, 200, {arbitrary: 'data'})
  }

  function addSpecial(respond, route, unpm, done) {
    unpm.special = special
    done()
  }
}

function setupWith(fn, middleware, done) {
  var router = Router()

  if(fn) {
    router.add('GET', routeOptions.path, fn)
  }

  server = http.createServer(handler({
    log: log,
    router: router,
    middleware: middleware,
    config: {host: {}}
  }))

  server.listen(8910, done)
  return server
}
