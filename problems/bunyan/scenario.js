module.exports = scenario

function scenario (log, cb) {
  function start () {
    process.nextTick(thing)
  }

  var value = 97

  function foo () {
    value *= 13
    cb(value)
  }

  start()

  function racer () {
    value &= 255
    setTimeout(foo, 0)
  }

  value = 213

  function thing () {
    value += 131
    setImmediate(racer)
  }
}
