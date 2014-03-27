var get_context = require('../../../lib/context')
  , config = require('../../../lib/config.json')
  , log = require('../../../lib/logging')({})
  , assert = require('assert')
  , test = require('tape')
  , http = require('http')
  , config = {}

// this needs to be imported after continuation local storage, creates the unpm
// namespace. Otherwise unpm won't be defined when clone_module executes.
var clone = require('../../../lib/models/Package/clone')

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

function setup(test) {
  get_context.reset()

  return function(t) {
    get_context.ns.run(function(context) {
      context.log = log
      context.config = config
      test(t)
    })
  }
}

test('can clone', setup(can_clone))

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

  server.listen(81234, onlistening)

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
