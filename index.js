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
handler = fnpm(config).handler

http.createServer(function(req, res) {
  console.log(req.method, req.url)
  handler(req, res)
}).listen(8123)
