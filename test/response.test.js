var test = require('tape')

var respond = require('../lib/respond')

test('verify json response', verifyJSONResponse)
test('verify unauthorized', verifyErrorResponse)
test('verify not found', verifyNotFound)
test('verify conflict', verifyConflict)
test('verify 500', verify_500)

function verifyJSONResponse(t) {
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

function verifyErrorResponse(t) {
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

function verifyNotFound(t) {
  var res = {}

  t.plan(3)

  res.writeHead = function(status, headers) {
    t.strictEqual(status, 404)
    t.deepEqual(headers, {'Content-Type': 'application/json'})
  }

  res.end = function(data) {
    t.strictEqual(data, JSON.stringify({
        error: 'notFound'
      , reason: 'Document not found.'
    }))
    t.end()
  }

  respond(null, res).notFound()
}

function verifyConflict(t) {
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

  respond(null, res).onError(new Error)
}
