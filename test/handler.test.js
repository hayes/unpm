var CLS = require('continuation-local-storage')
  , unpm = CLS.createNamespace('unpm')
  , http = require('http')

var handler = require('../lib/handler')
  , test = require('tape')

test('sets the response to continuation local storage', response_is_set)
test('sets the request to continuation local storage', request_is_set)
test('500 if route returns error', server_errors_corretly)
test('writes to response correctly', writes_to_response)
test('sets route to c.l.s.', matches_correct_route)

function request_is_set() {
  var req = new http.IncomingMessage
    , resp = new http.ServerResponse
}

function response_is_set() {
  var req = new http.IncomingMessage
    , resp = new http.ServerResponse
}

function calls_route() {
  var req = new http.IncomingMessage
    , resp = new http.ServerResponse
}

function writes_to_response() {
  var req = new http.IncomingMessage
    , resp = new http.ServerResponse
}

function server_errors_corretly() {
  var req = new http.IncomingMessage
    , resp = new http.ServerResponse
}
