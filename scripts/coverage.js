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

test('load tests', function(t) {
  t.plan(1)
  glob(path.resolve(__dirname, '../test/**/*.test.js'), function(err, files) {
    for(var i = 0, len = files.length; i < len; ++i) {
      require(files[i])
    }

    t.ok(true, 'loaded tests')
    t.end()
  })
})
