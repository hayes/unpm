module.exports = not_found

function not_found(req, res) {
  res.writeHead(409)
  res.write(JSON.stringify({
      error: 'conflict'
    , reason: 'Document update conflict.'
  }))
  res.end()
}

