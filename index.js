var fnpm = require('./lib/index')
  , http = require('http')
  , router = fnpm({})

http.createServer(function(req, res) {
  console.log(req.method, req.url)
  router.handler(req, res)
}).listen(8123)
