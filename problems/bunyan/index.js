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

      if (scenario) {
        var output = []
        scenario(createLog(output), function (value) {
          t.equal(value, 2964, 'got expected output value')
          t.equal(output.length, 6, '6 messages were logged')
          validate(0, 'info', 'scenario', 97)
          validate(2, 'info', 'scenario', 97)
          validate(3, 'info', 'thing', 228)
          validate(4, 'info', 'racer', 228)
          validate(5, 'info', 'foo', 2964)
          t.ok(
            output[1] && output[1][0] === 'error',
            'found error in the expected place'
          )

          t.end()
        })
      } else {
        t.end()
      }

      function validate (i, level, name, value) {
        var entry = output[i]
        t.ok(
          Array.isArray(entry) && entry && entry.length === 3,
          'entry is in expected format'
        )
        t.equal(entry && entry[0], level, 'log entry at expected log level')
        t.equal(entry && entry[1] && entry[1].value, value, 'log entry had expected value')
        t.equal(entry && entry[2], name, 'log call was from expected function')
      }
    }
  }
}

function createLog (store) {
  return {
    info: put.bind(null, 'info'),
    warn: put.bind(null, 'warn'),
    error: put.bind(null, 'error')
  }

  function put () {
    store.push(Array.prototype.slice.call(arguments))
  }
}
