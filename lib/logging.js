var bunyan = require('bunyan')
var path = require('path')

var noopLogger = {
  info: noop,
  error: noop,
  debug: noop
}

module.exports = logger

function logger(config) {
  var bunyanOptions = {}
  var logDir

  if(!config.verbose && !config.logDir && !config.log) {
    return noopLogger
  }

  bunyanOptions.name = 'unpm'
  bunyanOptions.streams = []

  if(config.verbose) {
    bunyanOptions.streams.push({
      level: config.log || 'info',
      stream: process.stdout
    })
  }

  if(config.logDir || (config.log && !config.verbose)) {
    logDir = config.logDir || process.cwd()

    bunyanOptions.streams.push({
      level: config.log || 'info',
      type: 'rotating-file',
      period: '1d',
      count: 10,
      path: path.join(logDir, 'unpm.log')
    })
  }

  return bunyan.createLogger(bunyanOptions)
}

function noop() {
  // no-op
}
