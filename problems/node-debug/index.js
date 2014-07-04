var readFile = require("graceful-fs").readFile;
var resolve = require("path").resolve;
var spawn = require("win-spawn");

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

      var server = spawn(
        "/usr/local/bin/node",
        [resolve(__dirname, "./server.js")],
        {encoding : "utf8", env : {"NODE_DEBUG" : "http"}}
      );

      var out = "", err = "";
      server.stdout.on("data", function (data) {
        out += data;
        if (out.match(/listening/)) {
          var client = spawn(
            "/usr/local/bin/node",
            [resolve(process.cwd(), filename)],
            {encoding : "utf8"}
          );

          var cout = "", cerr = "";
          client.stdout.on("data", function (data) { cout += data; });
          client.stderr.on("data", function (data) {
            cerr += data;
          });

          client.on("close", function (code) {
            t.equal(code, 0, "exited without errors");
            t.equal(cout, "BODY: hello\n");
            t.equal(cerr, "done!\n");

            server.kill();
          });
        }
      });
      server.stderr.on("data", function (data) {
        err += data;
      });

      server.on("close", function () {
        t.notOk(
          out.match(/parse error/) || err.match(/parse error/),
          "request was made successfully"
        );

        t.end();
      });

    }
  };
};
