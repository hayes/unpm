var get_package = require('./api/get_package')
  , get_tarball = require('./api/get_tarball')
  , sessions = require('./auth/sessions')
  , register = require('./auth/register')
  , publish = require('./api/publish')
  , update = require('./auth/update')
  , not_found = require('./api/404')
  , index = require('./api/index')
  , clone = require('./api/clone')
  , user = require('./auth/user')
  , Router = require('./router')
  , config = require('./config')
  , http = require('http')
  , router

router = Router(not_found)
router.add(
    'GET'
  , /^\/registry\/([^\/]*)\/-\/.*-(\d+\.\d+\.\d+).tgz$/
  , get_tarball
)

router.add('GET', /^\/registry\/-\/user\/org\.couchdb.user:([^\/]*)$/, user)
router.add('GET', /^\/registry\/$/, index)
router.add('GET', /^\/registry\/([^\/]*)$/, get_package)
router.add('GET', /^\/registry\/([^\/]*)\/([^\/]*)$/, get_package)

router.add('POST', /^\/clone\/([^\/]*)$/, clone)
router.add('POST', /^\/clone\/([^\/]*)\/([^\/]*)$/, clone)
router.add('POST', /^\/registry\/_session$/, sessions.create)

router.add('PUT', /^\/registry\/([^\/]*)$/, publish)
router.add(
    'PUT'
  , /^\/registry\/-\/user\/org\.couchdb.user:([^\/]*)$/
  , register
)
router.add(
    'PUT'
  , /^\/registry\/-\/user\/org\.couchdb.user:([^\/]*)\/.+$/
  , update
)

http.createServer(function(req, res) {
  console.log(req.method, req.url)
  router.handler(req, res)
}).listen(config.port)
