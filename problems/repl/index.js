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

      var scenario;
      t.doesNotThrow(function () {
        scenario = require(resolve(process.cwd(), filename));
      }, "loaded scenario OK");

      if (scenario) {
        scenario(function (server, repl) {
          t.ok(server, "test bootstrapper was passed a server");
          t.ok(repl, "test bootstrapper was passed a REPL");

          if (server) {
            var rcPath = resolve(__dirname, "../../node_modules/.bin/rc");
            var socket;
            if (process.platform === "win32") {
              socket = "\\\\.\\pipe\\tmp-repl\\bug-clinic.sock";
            }
            else {
              socket = "/tmp/repl/bug-clinic.sock";
            }

            var rc = spawn("node", [rcPath, socket]);

            var out = "", err = "";
            rc.stdout.on("data", function (data) {
              out += data.toString("utf8");
            });

            rc.stderr.on("data", function (data) {
              err += data.toString("utf8");
            });

            rc.stdin.write("app.__message\n");
            rc.stdin.end();

            rc.on("close", function (code) {
              t.equal(code, 0, "REPL client ran without error");

              server.close(function () {
                t.ok(out.match(/REPLs are neat/), "got expected value from REPL client");
                t.notOk(err, "got no error output from REPL client");

                repl.close();
                t.end();
              });
            });
          }
          else {
            t.end();
          }
        });
      }
      else {
        t.end();
      }
    }
  };
};
