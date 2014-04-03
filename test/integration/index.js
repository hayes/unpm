var backend = require('unpm-mem-backend')
  , fixture = require('./fixture.json')
  , unpm = require('../../index')
  , request = require('request')
  , semver = require('semver')
  , assert = require('assert')
  , url = require('url')

assert.end = function() {

}

function start(unpm_service, port, on_server_listening) {
  unpm_service.server.listen(
      port
    , on_server_listening.bind(unpm_service)
  )
}

function end(unpm_service) {
  unpm_service.server.close()
  assert.end()
}

verify_default_configuration(assert)

function verify_default_configuration(assert) {
  var config = {}
    , unpm_service

  config.host = {}
  config.host.hostname = 'localhost'
  config.host.protocol = 'http'
  config.host.port = 8123
  config.host.pathname = ''

  config.base_pathname = ''

  config.crypto = {}
  config.crypto.algorithm = 'sha512'
  config.crypto.saltLength = 30
  config.crypto.iterations = 10

  config.verbose = true

  config.backend = backend()

  unpm_service = unpm(config)

  start(unpm_service, config.host.port, on_server_listening)

  function on_server_listening() {
    // Put a package in unpm, then get it and make sure it's what we put in
    // there in the first place.
    put_package()
  }

  function put_package() {
    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.put(req_options, onput)

    function onput(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 201)

      try_putting_again()
    }
  }

  function try_putting_again() {
    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.put(req_options, onput)

    function onput(err, data) {
      if(err) {
        console.log(err)
      }

      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 409)
    }

    bump_version_and_put()
  }

  function bump_version_and_put() {
    var latest = Object.keys(fixture.versions).sort(semver.lt)[0]

    var new_version = latest.split('.')

    new_version = (1 + +new_version[0]) + '.' + new_version.slice(1).join('.')

    fixture.versions[new_version] = JSON.parse(JSON.stringify(
        fixture.versions[latest]
    ))

    fixture.versions[new_version].version = new_version

    fixture['dist-tags'].latest = new_version

    fixture._attachments[fixture.name + '-' + new_version + '.tgz'] =
      fixture._attachments[fixture.name + '-' + latest + '.tgz']

    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.put(req_options, onput)

    function onput(err, data) {
      assert.ok(!err)
      assert.ok(data)

      assert.strictEqual(data.statusCode, 201)

      get_latest()
    }
  }

  function get_latest() {
    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.get(req_options, onget)

    function onget(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.ok(data.statusCode, 201)

      var body = JSON.parse(data.body)

      var expected_tarballs = []
        , result_tarballs = []

      for(var v in body.versions) {
        result_tarballs.push(body.versions[v].dist.tarball)
      }

      for(var v in fixture.versions) {
        expected_tarballs.push('unpm/-/unpm-' + v + '.tgz')
      }

      assert.deepEqual(result_tarballs, expected_tarballs)

      for(var v in body.versions) {
        body.versions[v].dist.tarball = fixture.versions[v].dist.tarball
      }

      for(var key in body) {
        assert.deepEqual(body[key], fixture[key])
      }

      end(unpm_service)
    }
  }
}
