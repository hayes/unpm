var CLS = require('continuation-local-storage')
  , unpm = CLS.createNamespace('unpm')
  , Router = require('unpm-router')
  , http = require('http')
  , t = require('assert')
  , log = require('npmlog')

var handler = require('../lib/handler')
  , test = require('tape')

unpm.run(function() {
  unpm.set('log', log)
  req_and_resp_saved(t)
})

function req_and_resp_saved(t) {
  var router = Router()
    , options
    , server

  router.add('GET', 'arbitrary/path', arbitrary_handler)

  function arbitrary_handler(req, resp, route, respond) {
    console.log('handler called')

    t.equal(req, unpm.get('req'))
    t.equal(res, unpm.get('res'))
    t.equal(route, 'route')

    respond(null, 200, {arbitrary: 'data'})
  }

  unpm.set('router', router)

  server = http.createServer(handler)

  server.listen(8910, on_listen)

  function on_listen() {
    console.log('listening')

    options = {
        port: 8910
      , method: 'GET'
      , path: 'arbitrary/path'
      , host: 'localhost'
    }

    req = http.request(options, function(res) {
      console.log('got response!')

      t.end()
    })

    console.log('making request')
    req.write('hi')
    req.end()
    console.log('request made')
  }
}
