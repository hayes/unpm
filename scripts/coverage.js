var cov = require('mocha-lcov-reporter')
  , blanket = require('blanket')
  , glob = require('glob')
  , path = require('path')
  , tape = require('tape')
  , test

blanket = blanket({pattern: path.resolve(__dirname, '../lib/')})
blanket.setupCoverage()
test = tape.createHarness()
cov(test.createStream())

var cache = require.cache[
  path.resolve(__dirname, '../node_modules/tape/index.js')
]

cache.exports = test

test('load files', function(t) {
  t.plan(4)

  //load all tests and all source files
  var dirs = [
      '../lib/*.js'
    , '../lib/**/*.js'
    , '../test/*.test.js'
    , '../test/**/*.test.js'
  ]

  dirs.forEach(load)

  function load(dir) {
    glob(path.resolve(__dirname, dir), function(err, files) {
      for(var i = 0, len = files.length; i < len; ++i) {
        require(files[i])
      }

      t.ok(true, 'loaded ' + dir)
    })
  }
})
