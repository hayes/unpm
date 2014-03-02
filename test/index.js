var blanket = require('blanket')
  , glob = require('glob')
  , path = require('path')
  , tape = require('tape')
  , test

blanket = blanket({pattern: path.resolve(__dirname, '../lib/')})
blanket.setupCoverage()

module.exports = test = tape.createHarness()
test.stream = test.createStream()

test('load tests', function(t) {
  t.plan(1)
  glob(path.join(__dirname, '/**/*.test.js'), function(err, files) {
    for(var i = 0, len = files.length; i < len; ++i) {
      require(files[i])
    }

    t.ok(true, 'loaded tests')
    t.end()
  })
})
