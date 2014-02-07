module.exports = ok

function ok(req, res, data) {
  res.writeHead(200, {
      'Content-Type': 'application/json'
  })
  res.write(JSON.stringify(data))
  res.end()
}
