var context = require('../lib/context')
  , tape = require('tape')

module.exports = setup

function setup(up, down, run) {
  return function add_test(name, fn) {
    var test_context

    var test = tape(name, function(t) {
      context.run(function(new_context) {
        test_context = up ? (up(new_context) || new_context) : new_context
        fn.bind(test_context)(t)
      })
    })

    test.on('end', function() {
      context.reset()

      if(down) {
        context.ns.bind(down, test_context)(test_context)
      }
    })

    if(run) {
      test.on('run', function() {
        context.ns.bind(run, test_context)(test_context)
      })
    }

    return test
  }
}
