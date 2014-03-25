var create_session_store = require('../../lib/models/SessionStore')

var test = require('tape')

test('can set', function(t) {
  var store = create_session_store()

  store.set('yar', onset)

  function onset(err, token) {
    if(err) {
      t.ok(false, 'Error when setting data.')
    }

    store.get(token, onget)
  }

  function onget(err, data) {
    if(err) {
      t.ok(false, 'Error when getting data for token.')
    }

    t.strictEqual(data, 'yar')
    t.end()
  }
})

