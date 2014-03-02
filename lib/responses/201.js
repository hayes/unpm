module.exports = created

function created(req, res, data) {
  res.writeHead(201, {
      'Content-Type': 'application/json'
  })

  res.write(JSON.stringify(data))
  res.end()
}
