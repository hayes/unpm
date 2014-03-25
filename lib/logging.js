var bunyan = require('bunyan')
  , path = require('path')

var noop_logger = {
    info: noop
  , error: noop
}

module.exports = logger

function logger(config) {
  var bunyan_options = {}
    , log_dir

  if(!config.verbose && !config.log) {
    return noop_logger
  }

  bunyan_options.name = 'unpm'
  bunyan_options.streams = []

  if(config.verbose) {
    bunyan_options.streams.push({level: 'info', stream: process.stdout})
  }

  if(config.log) {
    log_dir = config.log_dir || process.cwd()

    bunyan_options.streams.push({
        level: 'info'
      , type: 'rotating-file'
      , period: '1d'
      , count: 10
      , path: path.join(log_dir, 'unpm.log')
    })
  }

  return bunyan.createLogger(bunyan_options)
}

function noop() {
  // no-op
}
