#!/usr/bin/env node

var load_config = require('../lib/config')
  , backend = require('unpm-fs-backend')
  , path = require('path')
  , nopt = require('nopt')
  , unpm = require('../')

var noptions = {
    'port': Number
  , 'verbose': Boolean
  , 'log': Boolean
  , 'logdir': String
  , 'datadir': String
}

var shorts = {
    'p': ['--port']
  , 'v': ['--verbose']
  , 'l': ['--log']
  , 'L': ['--logdir']
  , 'd': ['--datadir']
}

var config = nopt(noptions, shorts)

var CWD = process.cwd()

var unpm_service
  , tarballs_dir
  , user_dir
  , meta_dir
  , data_dir

config = load_config(config || {})

data_dir = path.normalize(config.datadir) || path.join(CWD, 'data')

if(!config.backend) {
  tarballs_dir = path.join(data_dir, 'tarballs')
  user_dir = path.join(data_dir, 'users')
  meta_dir = path.join(data_dir, 'meta')

  config.backend = backend(meta_dir, user_dir, tarballs_dir)
}

unpm_service = unpm(config)
unpm_service.server.listen(unpm_service.config.port)

unpm_service.log.info('Started unpm on port %s', unpm_service.config.port)
