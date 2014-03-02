var cov = require('mocha-lcov-reporter')
  , test = require('./index')

cov(test.stream)
