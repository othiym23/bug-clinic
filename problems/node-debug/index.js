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
        "node",
        [resolve(__dirname, "./server.js")],
        {env : {"NODE_DEBUG" : "http", "PATH" : process.env.PATH}}
      );

      var out = "", err = "";
      server.stdout.on("data", function (data) {
        console.log(data.toString("utf8").trim());
        out += data.toString("utf8");
        if (out.match(/listening/)) {
          var client = spawn("node", [resolve(process.cwd(), filename)]);

          var cout = "", cerr = "";
          client.stdout.on("data", function (data) { cout += data.toString("utf8"); });
          client.stderr.on("data", function (data) { cerr += data.toString("utf8"); });

          client.on("close", function (code) {
            t.equal(code, 0, "exited without errors");
            t.equal(cout, "BODY: hello\n", "got expected response from server");
            t.equal(cerr, "done!\n", "process logged at end");

            server.kill();
          });
        }
      });

      server.stderr.on("data", function (data) {
        console.log(data.toString("utf8").trim());
        err += data.toString("utf8");
      });

      server.on("close", function () {
        t.notOk(
          out.match(/parse error/) || err.match(/parse error/) || err.match(/EADDRINUSE/),
          "request was made successfully"
        );

        t.end();
      });

    }
  };
};
