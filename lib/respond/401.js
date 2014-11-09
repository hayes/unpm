module.exports = unauthorized

function unauthorized() {
  this.res.writeHead(401, {
    'Content-Type': 'application/json'
  })

  this.res.end(JSON.stringify({
    error: 'unauthorized',
    reason: 'Name or password is incorrect.'
  }))
}
