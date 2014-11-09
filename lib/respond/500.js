module.exports = onError

function onError() {
  this.res.writeHead(500)
  this.res.end('Something went wrong.')
}
