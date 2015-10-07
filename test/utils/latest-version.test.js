var test = require('tape')
var latest_version = require('../../lib/utils/latest-version')

test('returns latest version by semver in array', function(t) {
  t.equal(
      latest_version(['1.1.1', '1.5.1', '1.5.2', '1.0.1', '0.1.2'])
    , '1.5.2'
  )

  t.equal(
      latest_version(['0.1.1', '0.5.1', '1.5.2', '1.5.1', '1.4.2'])
    , '1.5.2'
  )

  t.equal(latest_version(['0.1.1']) , '0.1.1')
  t.equal(latest_version(['0.1.1', '0.1.90']) , '0.1.90')

  t.end()
})
