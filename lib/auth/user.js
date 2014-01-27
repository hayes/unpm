var not_found = require('../api/404')
  , on_error = require('../api/500')
  , Users = require('./user-store')

module.exports = get_user

function get_user(req, res, username) {
  Users.find(username, function(err, user) {
    if(err) {
      return on_error(req, res, err)
    }

    if(!username) {
      return not_found(req, res)
    }

    res.writeHead(200, {
        'Content-Type': 'application/json'
    })
    res.write(JSON.stringify(user))
    res.end()
  })
}
