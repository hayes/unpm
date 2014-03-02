var backend = require('unpm-leveldb')
  , levelup = require('levelup')
  , memdown = require('memdown')

module.exports = function() {
  return backend(levelup('/in/memory/', { db: memdown}))
}
