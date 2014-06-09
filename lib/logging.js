var bunyan = require('bunyan')
  , path = require('path')

var noop_logger = {
    info: noop
  , error: noop
  , debug: noop
}

module.exports = logger

function logger(config) {
  var bunyan_options = {}
    , log_dir

  if(!config.verbose && !config.logDir && !config.log) {
    return noop_logger
  }

  bunyan_options.name = 'unpm'
  bunyan_options.streams = []

  if(config.verbose) {
    bunyan_options.streams.push({
        level: config.log || 'info'
      , stream: process.stdout
    })
  }

  if(config.logDir || (config.log && !config.verbose)) {
    log_dir = config.logDir || process.cwd()

    bunyan_options.streams.push({
        level: config.log || 'info'
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
