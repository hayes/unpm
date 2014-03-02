module.exports = setup

function setup(app) {
  return on_error

  function on_error(req, res, err) {
    app.log.error('500', err.stack)
    res.writeHead(500)
    res.write('something went wrong')
    res.end()
  }
}
