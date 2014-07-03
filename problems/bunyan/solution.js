module.exports = scenario;

function scenario(log, cb) {
  function start() {
    process.nextTick(thing);
  }

  var value = 97;
  log.info({value : value}, "scenario");

  function foo() {
    value *= 13;
    log.info({value : value}, "foo");
    cb(value);
  }

  start();

  function racer() {
    value &= 255;
    log.info({value : value}, "racer");
    setTimeout(foo, 0);
  }

  // bad! value = 213;
  log.error("bad assignment on same tick");
  log.info({value : value}, "scenario");

  function thing() {
    value += 131;
    log.info({value : value}, "thing");
    process.nextTick(racer);
  }
}
