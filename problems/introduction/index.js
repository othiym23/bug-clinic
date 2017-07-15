var spawn = require('win-spawn')
var readFile = require('graceful-fs').readFile
var resolve = require('path').resolve
var format = require('util').format

var moment = require('moment')

module.exports = function create (options) {
  return {
    name: options.name,
    getStatement: function getStatement (callback) {
      readFile(resolve(__dirname, './problem.txt'), function (error, text) {
        if (error) return callback(error)

        callback(null, format(text.toString('utf8'), moment().format('MMM Do HH:MM')))
      })
    },

    verify: function verify (args, t) {
      var filename = args[0]
      if (!filename) {
        t.fail('must include file to verify')
        return t.end()
      }

      var test = spawn('node', [filename])
      var out = ''
      var err = ''

      test.stdout.on('data', function (data) {
        out += data
      })

      test.stderr.on('data', function (data) {
        err += data
      })

      test.on('close', function (code) {
        t.equal(code, 0, 'diagnosis ran without error')
        t.equal(n(out), 'i am okay', 'got expected standard output')
        t.equal(n(err), 'i am so incredibly not okay', 'got expected standard error')
        t.end()
      })
    }
  }
}

function n (buffer) {
  return buffer.toString('utf8').trim().toLowerCase()
}
