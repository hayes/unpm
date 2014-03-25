#!/usr/bin/env node

var nopt = require('nopt')
  , unpm = require('../index')

var noptions = {
    'port': Number
  , 'verbose': Boolean
  , 'log': Boolean
  , 'logdir': String
}

var shorts = {
    'p': ['--port']
  , 'v': ['--verbose']
  , 'l': ['--log']
  , 'L': ['--logdir']
}

var options = nopt(noptions, shorts)

unpm(options)
