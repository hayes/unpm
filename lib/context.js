var CLS = require('continuation-local-storage')
  , ns = CLS.createNamespace('unpm')

module.exports = function get_context() {
  return ns.active
}

module.exports.ns = ns
