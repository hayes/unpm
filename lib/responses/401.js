module.exports = not_found

function not_found(req, res) {
  res.writeHead(401, {
      'Content-Type': 'application/json'
  })
  res.write(JSON.stringify({
      error: 'unauthorized'
    , reason: 'Name or password is incorrect.'
  }))
  res.end()
}
