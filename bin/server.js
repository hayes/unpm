#!/usr/bin/env node

var nopt = require('nopt')
  , unpm = require('../index')

var noptions = { 'port': Number }
  , shorts = { 'p': ['--port'] }

var options = nopt(noptions, shorts)

unpm(options.port)
