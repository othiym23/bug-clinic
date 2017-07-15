var readFile = require('graceful-fs').readFile
var resolve = require('path').resolve

module.exports = function () {
  return {
    getStatement: function getStatement (callback) {
      readFile(
        resolve(__dirname, './problem.txt'),
        {encoding: 'utf-8'},
        callback
      )
    },

    verify: function verify (args, t) {
      var filename = args[0]
      if (!filename) {
        t.fail('must include file to verify')
        return t.end()
      }

      var scenario
      t.doesNotThrow(function () {
        scenario = require(resolve(process.cwd(), filename))
      }, 'loaded scenario OK')

      if (scenario) scenario(t)

      t.end()
    }
  }
}
