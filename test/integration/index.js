var backend = require('unpm-mem-backend')
  , fixture = require('./fixture.json')
  , unpm = require('../../index')
  , request = require('request')
  , assert = require('assert')
  , url = require('url')

assert.end = function() {

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

  config.backend = backend

  unpm_service = unpm(config)

  unpm_service.server.listen(config.host.port, on_server_listening)

  function on_server_listening() {
    // Put a package in unpm, then get it and make sure it's what we put in
    // there in the first place.

    var req_options = {
        uri: url.format(config.host) + '/unpm'
      , body: JSON.stringify(fixture)
    }

    var req = request.put(req_options, onput)

    function onput(err, data) {
      assert.ok(!err)
      assert.ok(data)
      assert.strictEqual(data.statusCode, 201)

      unpm_service.server.close()
      assert.end()
    }
  }
}
