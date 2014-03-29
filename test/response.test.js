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

  t.plan(3)

  res.writeHead = function(status, headers) {
    t.strictEqual(status, 200)
    t.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.end = function(data) {
    t.strictEqual(data, '{"arbitrary":"data"}')
    t.end()
  }

  respond(null, res).json(200, {arbitrary: 'data'})
}

function verify_error_response(t) {
  var res = {}

  t.plan(3)

  res.writeHead = function(status, headers) {
    t.strictEqual(status, 401)
    t.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.end = function(data) {
    t.strictEqual(data, JSON.stringify({
        error: 'unauthorized'
      , reason: 'Name or password is incorrect.'
    }))
    t.end()
  }

  respond(null, res).unauthorized()
}

function verify_not_found(t) {
  var res = {}

  t.plan(3)

  res.writeHead = function(status, headers) {
    t.strictEqual(status, 404)
    t.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.end = function(data) {
    t.strictEqual(data, JSON.stringify({
        error: 'not_found'
      , reason: 'Document not found.'
    }))
    t.end()
  }

  respond(null, res).not_found()
}

function verify_conflict(t) {
  var res = {}

  t.plan(3)

  res.writeHead = function(status, headers) {
    t.strictEqual(status, 409)
    t.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.end = function(data) {
    t.strictEqual(data, JSON.stringify({
        error: 'conflict'
      , reason: 'Document update conflict.'
    }))
    t.end()
  }

  respond(null, res).conflict()
}

function verify_500(t) {
  var res = {}

  t.plan(2)

  res.writeHead = function(status) {
    t.equal(status, 500)
  }

  res.end = function(data) {
    t.strictEqual('Something went wrong.', data)
    t.end()
  }

  respond(null, res).on_error(new Error)
}
