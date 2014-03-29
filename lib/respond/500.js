module.exports = on_error

function on_error() {
  this.res.writeHead(500)
  this.res.write('Something went wrong.')
  this.res.end()
}
