module.exports = on_error

function on_error(req, res, err) {
  process.stderr.write(err.message)
  res.writeHead(500)
  res.write('something went wrong')
  res.end()
}
