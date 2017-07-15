var readFile = require('fs').readFile

module.exports = scenario

function scenario (jsonPath, cb) {
  readFile(jsonPath, {encoding: 'utf8'}, function (error, contents) {
    cb(error, JSON.parse(contents))
  })
}
