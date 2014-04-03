var backend = require('unpm-mem-backend')
  , fixture = require('./fixture.json')
  , unpm = require('../../index')
  , request = require('request')
  , semver = require('semver')
  , assert = require('assert')
  , url = require('url')

var tarball = fixture

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

function nest(functions) {
  if(!functions.length) {
    return
  }

  functions.shift()(function() {
    nest(functions)
  })
}

verify_default_configuration(assert)

function verify_default_configuration(assert) {
  var config = {}
    , unpm_service

  config.host = {}
  config.host.hostname = 'localhost'
  config.host.protocol = 'http'
  config.host.port = 8124
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
    var fns = [
        put_package
      , try_putting_again
      , bump_version_and_put
      , get_latest
      , get_nonexistent_version
      , get_old_version
      , get_tarball
      , end.bind(null, unpm_service)
    ]

    nest(fns)
  }

  function put_package(done) {
    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.put(req_options, onput)

    function onput(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 201)

      done()
    }
  }

  function try_putting_again(done) {
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

    done()
  }

  function bump_version_and_put(done) {
    var latest = Object.keys(fixture.versions).sort(semver.lt)[0]

    var new_version = latest.split('.')

    new_version = (1 + +new_version[0]) + '.' + new_version.slice(1).join('.')

    fixture.versions[new_version] = JSON.parse(JSON.stringify(
        fixture.versions[latest]
    ))

    fixture.versions[new_version].version = new_version

    fixture['dist-tags'].latest = new_version

    fixture.versions[new_version].dist.tarball = url.format(config.host) +
       '/unpm/-/unpm-' + new_version + '.tgz'

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

      done()
    }
  }

  function get_latest(done) {
    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.get(req_options, onget)

    function onget(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 200)

      var body = JSON.parse(data.body)

      var expected_tarballs = []
        , result_tarballs = []

      for(var v in body.versions) {
        result_tarballs.push(body.versions[v].dist.tarball)
      }

      for(var v in fixture.versions) {
        expected_tarballs.push(
            url.format(config.host) + '/unpm/-/unpm-' + v + '.tgz'
        )
      }

      assert.deepEqual(result_tarballs[0], expected_tarballs[0])

      // The body has more keys than the fixture, which should be redundant
      // with the fixture.
      for(var key in body) {
        assert.deepEqual(body[key], fixture[key])
      }

      done()
    }
  }

  function get_nonexistent_version(done) {
    var req_options = {
        uri: url.format(config.host) + '/unpm/0.0.1'
      , body: JSON.stringify(fixture)
    }

    var req = request.get(req_options, onget)

    function onget(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 404)

      var body = JSON.parse(data.body)

      assert.strictEqual(body.error, 'not_found')
      assert.strictEqual(body.reason, 'Document not found.')

      done()
    }
  }

  function get_old_version(done) {
    var req_options = {
        uri: url.format(config.host) + '/unpm/0.0.9'
      , body: JSON.stringify(fixture)
    }

    var req = request.get(req_options, onget)

    function onget(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 200)

      var body = JSON.parse(data.body)

      var expected = fixture.versions['0.0.9']

      assert.deepEqual(expected, body)

      done()
    }
  }

  function get_tarball(done) {
    var req_options = {
        uri: url.format(config.host) + '/unpm/-/unpm-0.0.9.tgz'
      , body: JSON.stringify(fixture)
    }

    var req = request.get(req_options, onget)

    function onget(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 200)

      var expected = Buffer(
          fixture._attachments['unpm-0.0.9.tgz'].data
        , 'base64'
      ).toString()

      assert.strictEqual(
          data.body
        , expected
      )

      done()
    }
  }
}
