var responses = {}

module.exports.responses = responses

responses.ok = require('./200')
responses.error = require('./500')
responses.created = require('./201')
responses.conflict = require('./409')
responses.not_found = require('./404')
responses.unauthorized = require('./401')
