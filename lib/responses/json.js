module.exports = json

function json(req, res, status, data) {
  res.writeHead(status, {
      'Content-Type': 'application/json'
  })

  res.write(data)
  res.end()
}
