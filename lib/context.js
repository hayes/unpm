var CLS = require('continuation-local-storage')
  , ns = CLS.createNamespace('unpm')

module.exports = get_context
module.exports.reset = reset
module.exports.run = run
module.exports.ns = ns

function get_context() {
  return ns.active
}

function reset() {
  CLS.destroyNamespace('unpm')
  module.exports.ns = ns = CLS.createNamespace('unpm')
}

function run(fn) {
  return ns.run(fn)
}
