var clone = require('../../../lib/models/Package/clone')
  , config = require('../../../lib/config.json')
  , log = require('../../../lib/logging')({})
  , setup = require('../../setup')
  , http = require('http')

var fake_meta = {}

fake_meta['dist-tags'] = {'latest': '1.0.0'}
fake_meta.versions = {}
fake_meta.versions['1.0.0'] = {}
fake_meta.versions['1.0.0'].dist = {tarball: 'url-for-a-tarball'}

config.host = {
    hostname: 'localhost'
  , protocol: 'http'
  , port: 81234
  , pathname: ''
}

config.public_registry = 'public-registry'

var test = setup(function(context) {
  context.log = log
  context.config = config
})

test('can clone', function can_clone(t) {
  t.plan(3)

  var FakePackage
    , server

  // mock out the Package object.
  FakePackage = {}

  FakePackage.get_version_meta = function(name, version, done) {
    t.strictEqual(name, 'arbitrary-name')
    t.strictEqual(version, '1.0.0')

    done(null, fake_meta)
  }


  FakePackage.add = function(name, version, tags, meta, tarball, done) {
    done(null, meta)
  }

  // set up a fake server to serve packages.
  server = http.createServer(function(req, res) {
    res.end(JSON.stringify(fake_meta))
  })

  server.listen(81234, onlistening)

  function onlistening() {
    clone.call(FakePackage, 'arbitrary-name', '1.0.0', false, oncloned)

    function oncloned(err, data) {
      if(err) {
        throw err
      }

      t.strictEqual(data, fake_meta)
      server.close()
    }
  }
})
