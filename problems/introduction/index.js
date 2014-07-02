var spawn = require("child_process").spawn;

module.exports = {
  verify : function verify(args, t) {
    var filename = args[0];
    if (!filename) {
      t.fail("must include file to verify");
      return t.end();
    }

    var test = spawn("node", [filename]);
    // console.dir(test);
    var out = "", err = "";

    test.stdout.on("data", function (data) {
      out += data;
    });

    test.stderr.on("data", function (data) {
      err += data;
    });

    test.on("close", function (code) {
      t.equal(code, 0, "diagnosis ran without error");
      t.equal(n(out), "i am okay", "got expected standard output");
      t.equal(n(err), "i am so incredibly not okay", "got expected standard error");
      t.end();
    });
  }
};

function n(buffer) {
  return buffer.toString("utf8").trim().toLowerCase();
}
