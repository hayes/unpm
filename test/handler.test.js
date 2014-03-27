var get_context = require('../lib/context')
  , handler = require('../lib/handler')
  , log = require('../lib/logging')({})
  , Router = require('unpm-router')
  , setup = require('./setup')
  , http = require('http')

var test = setup(function(context) {
  context.log = log
  context.router = Router()
})

test('req and resp saved', req_and_resp_saved)
test('not found and 500 works', errors_work_as_expected)

function req_and_resp_saved(t) {
  var context = get_context()
    , router = context.router
    , options
    , server

  router.add('GET', '/arbitrary/path', arbitrary_handler)

  function arbitrary_handler(req, res, route, respond) {
    var context = get_context()

    t.equal(req, context.req)
    t.equal(res, context.res)
    t.equal(route, context.route)
    t.equal(route.route, '/arbitrary/path')

    respond(null, 200, {arbitrary: 'data'})
  }

  server = http.createServer(handler)

  server.listen(8910, on_listen)

  function on_listen() {
    options = {
        port: 8910
      , method: 'GET'
      , path: '/arbitrary/path'
      , host: 'localhost'
    }

    var req = http.request(options, function(res) {
      server.close(t.end.bind(t))
    })

    req.write('hi')
    req.end()
  }
}

function errors_work_as_expected(t) {
  var context = get_context()
    , router = context.router
    , options
    , server

  t.plan(2)
  router.add('GET', '/500', handler_500)

  function handler_500(req, res, route, respond) {
    respond(new Error('woo!'))
  }

  server = http.createServer(handler)

  server.listen(8910, 'localhost', on_listen)

  function on_listen() {
    options = {
        port: 8910
      , method: 'GET'
      , path: '/500'
      , host: 'localhost'
    }

    var req = http.request(options, function(res) {

      t.strictEqual(res.statusCode, 500)

      next_request()
    })

    req.write('hi')
    req.end()
  }

  function next_request() {
    options = {
        port: 8910
      , method: 'GET'
      , path: '/'
      , host: 'localhost'
    }

    var req = http.request(options, function(res) {
      t.strictEqual(res.statusCode, 404)

      server.close(t.end.bind(t))
    })

    req.write('hi')
    req.end()
  }
}
