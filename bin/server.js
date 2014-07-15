#!/usr/bin/env node

var load_config = require('../lib/config')
  , backend = require('unpm-fs-backend')
  , path = require('path')
  , nopt = require('nopt')
  , unpm = require('../')

var noptions = {
    'port': Number
  , 'quiet': Boolean
  , 'log': String
  , 'logdir': String
  , 'datadir': String
  , 'fallback': String
  , 'configfile': String
}

var shorts = {
    'p': ['--port']
  , 'q': ['--quiet']
  , 'l': ['--log']
  , 'L': ['--logdir']
  , 'd': ['--datadir']
  , 'F': ['--fallback']
  , 'c': ['--configfile']
}

var config = nopt(noptions, shorts)

if(config.logdir) {
  config.logDir = config.logdir
}

if(config.quiet) {
  config.verbose = false
}

var CWD = process.cwd()

var unpm_service
  , tarballs_dir
  , store_dir
  , user_dir
  , meta_dir
  , data_dir

config = load_config(config || {})

data_dir = config.datadir ?
  path.normalize(config.datadir) :
  path.join(CWD, 'data')

if(!config.backend) {
  tarballs_dir = path.join(data_dir, 'tarballs')
  user_dir = path.join(data_dir, 'users')
  meta_dir = path.join(data_dir, 'meta')
  store_dir = path.join(data_dir, 'store')

  config.backend = backend(meta_dir, user_dir, tarballs_dir, store_dir)
}

unpm_service = unpm(config)
unpm_service.server.listen(unpm_service.config.host.port)

unpm_service.log.info('Started unpm on port %s', unpm_service.config.host.port)
