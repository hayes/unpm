var config = require('../../../lib/config.json')
  , log = require('../../../lib/logging')({})
  , http = require('http')

var CLS = require('continuation-local-storage')
  , test = require('tape')

var unpm = CLS.createNamespace('unpm')
  , config = {}

// this needs to be imported after continuation local storage, creates the unpm
// namespace. Otherwise unpm won't be defined when the module executes.
var clone = require('../../../lib/models/Package/clone')

var fake_meta = {}

fake_meta['dist-tags'] = {'latest': '1.0.0'}
fake_meta.versions = {}
fake_meta.versions['1.0.0'] = {}
fake_meta.versions['1.0.0'].dist = {tarball: 'url-for-a-tarball'}

config.host = {
    hostname: 'localhost'
  , protocol: 'http'
  , port: 8123
  , pathname: ''
}

config.public_registry = 'public-registry'

unpm.run(function() {
  unpm.set('log', log)
  unpm.set('config', config)

  test('can clone', can_clone)
})

function can_clone(assert) {
  assert.plan(3)

  var FakePackage
    , server

  // mock out the Package object.
  FakePackage = {}

  FakePackage.get_version_meta = function(name, version, done) {
    assert.strictEqual(name, 'arbitrary-name')
    assert.strictEqual(version, '1.0.0')

    done(null, fake_meta)
  }


  FakePackage.add = function(name, version, tags, meta, tarball, done) {
    done(null, meta)
  }

  // set up a fake server to serve packages.
  server = http.createServer(function(req, res) {
    res.end(JSON.stringify(fake_meta))
  })

  server.listen(8123, onlistening)

  function onlistening() {
    clone.call(FakePackage, 'arbitrary-name', '1.0.0', false, oncloned)

    function oncloned(err, data) {
      if(err) {
        throw err
      }

      assert.strictEqual(data, fake_meta)
      server.close()
    }
  }
}
