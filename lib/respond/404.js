module.exports = notFound

function notFound() {
  this.res.writeHead(404, {
    'Content-Type': 'application/json'
  })

  this.res.end(JSON.stringify({
    error: 'notFound',
    reason: 'Document not found.'
  }))
}
