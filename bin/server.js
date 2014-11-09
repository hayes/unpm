#!/usr/bin/env node

var loadConfig = require('../lib/config')
var backend = require('unpm-fs-backend')
var path = require('path')
var nopt = require('nopt')
var unpm = require('../')

var noptions = {
  'port': Number,
  'quiet': Boolean,
  'log': String,
  'logdir': String,
  'datadir': String,
  'fallback': String,
  'configfile': String
}

var shorts = {
  'p': ['--port'],
  'q': ['--quiet'],
  'l': ['--log'],
  'L': ['--logdir'],
  'd': ['--datadir'],
  'F': ['--fallback'],
  'c': ['--configfile']
}

var config = nopt(noptions, shorts)

if(config.logdir) {
  config.logDir = config.logdir
}

if(config.quiet) {
  config.verbose = false
}

var CWD = process.cwd()

var unpmService
var tarballsDir
var storeDir
var userDir
var metaDir
var dataDir

config = loadConfig(config || {})

dataDir = config.datadir ?
  path.normalize(config.datadir) :
  path.join(CWD, 'data')

if(!config.backend) {
  tarballsDir = path.join(dataDir, 'tarballs')
  userDir = path.join(dataDir, 'users')
  metaDir = path.join(dataDir, 'meta')
  storeDir = path.join(dataDir, 'store')

  config.backend = backend(metaDir, userDir, tarballsDir, storeDir)
}

unpmService = unpm(config)
unpmService.server.listen(unpmService.config.host.port)

unpmService.log.info('Started unpm on port %s', unpmService.config.host.port)
