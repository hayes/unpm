module.exports = function getRequestUrl (req, defaultHostname, defaultPort, defaultProto) {
  var hostHeader = getFirstHeaderValue(req.headers.host)
  var hostnameHeader = getFirstHeaderValue(req.headers.hostname)
  var forwardedHostHeader = getFirstHeaderValue(req.headers['x-forwarded-host'])
  var forwardedPortHeader = getFirstHeaderValue(req.headers['x-forwarded-port'])
  var forwardedProtoHeader = getFirstHeaderValue(req.headers['x-forwarded-proto'])
  var localPort = req.socket.localPort
  var localAddress = req.socket.localAddress

  var path = req.url
  var method = req.method
  var hostname = null
  var port = null
  var protocol = null

  if (hostnameHeader) {
    hostname = hostnameHeader
  } else if (hostHeader) {
    var parts = hostHeader.split(':')
    hostname = parts[0]
    port = parts[1]
  }

  hostname = hostname || defaultHostname || localAddress
  port = port || defaultPort || localPort

  if (forwardedHostHeader) {
    var parts = forwardedHostHeader.split(':')
    hostname = parts[0]

    if (forwardedPortHeader) {
      port = forwardedPortHeader
    } else if (parts[1]) {
      port = parts[1]
    }
  }

  if (forwardedProtoHeader) {
    proto = forwardedProtoHeader
  } else if (!forwardedHostHeader && defaultProto) {
    proto = defaultProto
  } else {
    proto = (+port === 443) ? 'https' : 'http'
  }

  return {
    host: hostname + ':' + port,
    hostname: hostname,
    port: +port,
    protocol: proto,
    method: method,
    path: path
  }
}

function getFirstHeaderValue (header) {
  return header && header.split(',')[0]
}

