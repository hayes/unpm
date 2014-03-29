module.exports = json

function json(status, data) {
  this.res.writeHead(status, {
      'Content-Type': 'application/json'
  })

  this.res.write(data)
  this.res.end()
}
