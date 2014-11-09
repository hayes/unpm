module.exports = conflict

function conflict() {
  this.res.writeHead(409, {
    'Content-Type': 'application/json'
  })

  this.res.end(JSON.stringify({
    error: 'conflict',
    reason: 'Document update conflict.'
  }))
}

