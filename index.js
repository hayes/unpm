var fs_tarballs = require('fnpm-fs-tarballs')
  , backend = require('fnpm-leveldb')
  , fnpm = require('./lib/index')
  , levelup = require('levelup')
  , mkdirp = require('mkdirp')
  , http = require('http')
  , data_dir = './data'
  , config = {}
  , handler
  , db

mkdirp.sync(data_dir + '/tarballs')
db = levelup(data_dir + '/db')
config.backend = fs_tarballs(backend(db), './data/tarballs')

http.createServer(fnpm(config).handler).listen(8123)
