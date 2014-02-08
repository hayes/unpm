module.exports = setup

function setup(app) {
  return on_error

  function on_error(req, res, err) {
    app.log.err('500', err.message)
    res.writeHead(500)
    res.write('something went wrong')
    res.end()
  }
}
