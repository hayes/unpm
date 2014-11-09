module.exports = json

function json(status, data) {
  this.res.writeHead(status, {
    'Content-Type': 'application/json'
  })

  try {
    return this.res.end(JSON.stringify(data))
  } catch(err) {
    return this.onError(err)
  }
}
