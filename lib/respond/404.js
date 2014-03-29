module.exports = not_found

function not_found() {
  this.res.writeHead(404, {
      'Content-Type': 'application/json'
  })
  this.res.write(JSON.stringify({
      error: 'not_found'
    , reason: 'Document not found.'
  }))
  this.res.end()
}
