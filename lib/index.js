var get_package = require('./api/get_package')
  , not_found = require('./api/404')
  , index = require('./api/index')
  , clone = require('./api/clone')
  , Router = require('./router')
  , http = require('http')
  , router

router = Router(not_found)
router.add('GET', /^\/registry\/$/, index)
router.add('GET', /^\/registry\/([^\/]*)$/, get_package)
router.add('GET', /^\/registry\/([^\/]*)\/([^\/]*)$/, get_package)

router.add('POST', /^\/clone\/([^\/]*)$/, clone)
router.add('POST', /^\/clone\/([^\/]*)\/([^\/]*)$/, clone)

http.createServer(function(req, res) {
  console.log(req.method, req.url)
  router.handler(req, res)
}).listen(8123)
