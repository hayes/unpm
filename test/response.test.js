var setup = require('./setup')
  , test = setup()

var respond = require('../lib/respond')

test('verify json response', verify_json_response)
test('verify unauthorized', verify_error_response)
test('verify not found', verify_not_found)
test('verify conflict', verify_conflict)
test('verify 500', verify_500)

function verify_json_response(t) {
  var res = {}

  res.writeHead = function(status, headers) {
    t.strictEqual(status, 200)
    t.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.write = function(data) {
    t.strictEqual(data, '{"arbitrary": "data"}')
  }

  res.end = function() {
    t.end()
  }

  respond(null, res).json(200, '{"arbitrary": "data"}')
}

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

  respond(null, res).unauthorized()
}

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

  respond(null, res).not_found()
}

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

  respond(null, res).conflict()
}

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

  respond(null, res).on_error(new Error)
}
