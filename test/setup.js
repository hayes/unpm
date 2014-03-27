var context = require('../lib/context')
  , test = require('tape')

module.exports = setup

function setup(create_context) {
  return function add_test(name, fn) {
    test(name, function(t) {
      context.reset()
      context.run(function(new_context) {
        if(create_context) {
          new_context = create_context(new_context) || new_context
        }

        fn.bind(new_context)(t)
      })
    })
  }
}
