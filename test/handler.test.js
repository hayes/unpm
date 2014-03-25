var CLS = require('continuation-local-storage')
  , log = require('../lib/logging')({})
  , Router = require('unpm-router')
  , http = require('http')
  , test = require('tape')

var unpm = CLS.createNamespace('unpm')

var handler = require('../lib/handler')

unpm.run(function() {
  unpm.set('log', log)
  test('req and resp saved', req_and_resp_saved)
})

unpm.run(function() {
  unpm.set('log', log)
  test('not found and 500 works', errors_work_as_expected)
})

function req_and_resp_saved(t) {
  var router = Router()
    , options
    , server

  router.add('GET', '/arbitrary/path', arbitrary_handler)

  function arbitrary_handler(req, res, route, respond) {

    t.equal(req, unpm.get('req'))
    t.equal(res, unpm.get('res'))
    t.equal(route, unpm.get('route'))
    t.equal(route.route, '/arbitrary/path')

    respond(null, 200, {arbitrary: 'data'})
  }

  unpm.set('router', router)

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
  t.plan(2)

  var router = Router()
    , options
    , server

  router.add('GET', '/500', handler_500)

  function handler_500(req, res, route, respond) {
    respond(new Error('woo!'))
  }

  unpm.set('router', router)

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
