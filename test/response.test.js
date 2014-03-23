var test = require('tape')

var response = require('../lib/responses')

test('verify json response', verify_json_response)

function verify_json_response(assert) {
  var res = {}

  res.writeHead = function(status, headers) {
    assert.strictEqual(status, 200)
    assert.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.write = function(data) {
    assert.strictEqual(data, '{"arbitrary": "data"}')
  }

  res.end = function() {
    assert.end()
  }

  response.json(null, res, 200, '{"arbitrary": "data"}')
}

test('verify unauthorized', verify_error_response)

function verify_error_response(assert) {
  var res = {}

  res.writeHead = function(status, headers) {
    assert.strictEqual(status, 401)
    assert.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.write = function(data) {
    assert.strictEqual(data, JSON.stringify({
        error: 'unauthorized'
      , reason: 'Name or password is incorrect.'
    }))
  }

  res.end = function() {
    assert.end()
  }

  response.unauthorized(null, res)
}

test('verify not found', verify_not_found)

function verify_not_found(assert) {
  var res = {}

  res.writeHead = function(status, headers) {
    assert.strictEqual(status, 404)
    assert.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.write = function(data) {
    assert.strictEqual(data, JSON.stringify({
        error: 'not_found'
      , reason: 'Document not found.'
    }))
  }

  res.end = function() {
    assert.end()
  }

  response.not_found(null, res)
}

test('verify conflict', verify_conflict)

function verify_conflict(assert) {
  var res = {}

  res.writeHead = function(status, headers) {
    assert.strictEqual(status, 409)
    assert.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.write = function(data) {
    assert.strictEqual(data, JSON.stringify({
        error: 'conflict'
      , reason: 'Document update conflict.'
    }))
  }

  res.end = function() {
    assert.end()
  }

  response.conflict(null, res)
}

test('verify 500', verify_500)

function verify_500(assert) {
  var res = {}

  res.writeHead = function(status) {
    assert.equal(status, 500)
  }

  res.write = function(data) {
    assert.strictEqual('Something went wrong.', data)
  }

  res.end = function() {
    assert.end()
  }

  response.on_error(null, res)
}
