module.exports = not_found

function not_found(req, res) {
  res.writeHead(404, {
      'Content-Type': 'application/json'
  })
  res.write(JSON.stringify({
      error: 'not_found'
    , reason: 'document not found'
  }))
  res.end()
}
