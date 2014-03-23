module.exports = on_error

function on_error(req, res, err) {
  res.writeHead(500)
  res.write('Something went wrong.')
  res.end()
}
