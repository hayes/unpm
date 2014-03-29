module.exports = unauthorized

function unauthorized() {
  this.res.writeHead(401, {
      'Content-Type': 'application/json'
  })
  this.res.write(JSON.stringify({
      error: 'unauthorized'
    , reason: 'Name or password is incorrect.'
  }))
  this.res.end()
}
