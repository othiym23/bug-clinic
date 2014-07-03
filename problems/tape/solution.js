module.exports = scenario;

function scenario(t) {
  t.ok(isGreaterThanZero(Infinity), "1 is greater than 0");
  t.ok(isGreaterThanZero(1), "1 is greater than 0");
  t.notOk(isGreaterThanZero(0), "0 *is* 0, not greater than 0");
  t.notOk(isGreaterThanZero(-0), "why does -0 exist");
  t.notOk(isGreaterThanZero(-1), "-1 is definitely not greater than 0");
  t.notOk(isGreaterThanZero(-Infinity), "1 is greater than 0");

  function isGreaterThanZero(value) { return value > 0; }
}
