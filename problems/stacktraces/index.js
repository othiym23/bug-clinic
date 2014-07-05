var readFile = require("graceful-fs").readFile;
var resolve = require("path").resolve;
var domain = require("domain");

module.exports = function () {
  return {
    getStatement : function getStatement(callback) {
      readFile(
        resolve(__dirname, "./problem.txt"),
        {encoding : "utf-8"},
        callback
      );
    },

    verify : function verify(args, t) {
      var filename = args[0];
      if (!filename) {
        t.fail("must include file to verify");
        return t.end();
      }

      var scenario = require(resolve(process.cwd(), filename));

      var heh = domain.create();
      heh.on("error", function (error) {
        t.ifError(error);
        t.end();
      });

      heh.run(function () {
        scenario(resolve(__dirname, "./undefined.json"), function (error) {
          t.ok(error instanceof Error, "got error");
          var stack = error.stack;

          t.ok(stack.match(/stacktraces(\/|\\)index/), "found previous stack");
          t.ok(stack.match(/Object.parse/), "found current stack");

          t.end();
        });
      });
    }
  };
};
