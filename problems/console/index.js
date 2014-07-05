var readFile = require("graceful-fs").readFile;
var resolve = require("path").resolve;
var spawn = require("win-spawn");
var inspect = require("util").inspect;

module.exports = function () {
  return {
    getStatement : function getStatement(callback) {
      readFile(
        resolve(__dirname, "./problem.txt"),
        {encoding : "utf-8"},
        dump
      );

      function dump(error, text) {
        if (error) return callback(error);

        callback(null, text);
      }
    },

    verify : function verify(args, t) {
      var testerPath = args[0];
      if (!testerPath) {
        t.fail("must include program to verify");
        return t.end();
      }

      var jsonPath = resolve(__dirname, "./mushroom-kingdom.json");
      var scenarioPath = resolve(process.cwd(), testerPath);

      var failer = spawn("node", [scenarioPath]);

      var failout = "", failerr = "";
      failer.stdout.on("data", function (data) {
        failout += data.toString("utf8");
      });

      failer.stderr.on("data", function (data) {
        failerr += data.toString("utf8");
      });

      failer.on("close", function () {
        t.ok(failerr.match(/bowser/, "found error stack"));
        t.notOk(failout, "no standard output");

        var succeeder = spawn("node", [scenarioPath, jsonPath]);

        var successout = "", successerr = "";
        succeeder.stdout.on("data", function (data) {
          successout += data.toString("utf8");
        });

        succeeder.stderr.on("data", function (data) {
          successerr += data.toString("utf8");
        });

        succeeder.on("close", function (code) {
          t.equal(code, 0, "program executed successfully");
          if (!successout) {
            t.fail("no standard output");
            return t.end();
          }

          t.equals(successerr.indexOf(
            "Trace: traced"),
            0,
            "found trace 1 (will you always have an error?)"
          );
          t.ok(successerr.match(/peach/), "found more evidence that trace worked");
          t.ok(successerr.match(/koopa/), "found yet even more evidence");

          t.doesNotThrow(function () {
            var baseline = require("./mushroom-kingdom.json");
            t.deepEqual(
              successout.trim(),
              inspect(baseline),
              "got the expected JSON"
            );
          }, "JSON parsed OK");

          t.end();
        });
      });
    }
  };
};
