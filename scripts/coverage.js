var cov = require('mocha-lcov-reporter')
  , blanket = require('blanket')
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

require('../index')
require('../test')
