var style = require('jsl/rules')
  , path = require('path')
  , test = require('tape')

test(
      'code passes linter'
  , style.test([path.resolve(__dirname, '..', 'index.js')])
)
