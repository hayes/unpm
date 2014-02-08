module.exports = setup

function setup(app) {
  var responses = {}

  responses.ok = require('./200')
  responses.created = require('./201')
  responses.conflict = require('./409')
  responses.not_found = require('./404')
  responses.unauthorized = require('./401')

  responses.error = require('./500')(app)

  return {responses: responses}
}


