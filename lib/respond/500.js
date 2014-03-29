module.exports = on_error

function on_error() {
  this.res.writeHead(500)
  this.res.end('Something went wrong.')
}
