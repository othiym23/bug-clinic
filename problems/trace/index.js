var readFile = require("graceful-fs").readFile;
var resolve = require("path").resolve;

var get = require("request").get;
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
      t.plan(13);

      var filename = args[0];
      if (!filename) {
        t.fail("must include file to verify");
        return t.end();
      }

      var server = spawn("node", [resolve(process.cwd(), filename)]);
      var serverErr = "";
      server.stderr.on("data", function (data) {
        serverErr += data.toString("utf8");
        if (serverErr.match(/up\n/)) ready();
      });

      function ready() {
        var jstracePath = resolve(__dirname, "../../node_modules/.bin/jstrace");
        var tracerPath = resolve(__dirname, "./tracer.js");

        process.env.DEBUG = "jstrace";
        var tracer = spawn("node", [jstracePath, "-p", server.pid, tracerPath]);

        var traceOut = "", traceErr = "";
        tracer.stdout.on("data", function (data) {
          traceOut += data.toString("utf8");
        });
        tracer.stderr.on("data", function (data) {
          traceErr += data.toString("utf8");
          if (traceErr.match(/up\n/)) {
            traceErr = "";
            setTimeout(fetch, 500);
          }
        });

        tracer.on("exit", function (code) {
          t.equal(code, 0, "tracer exited OK");

          var urls = traceOut.split("\n");
          var codes = traceErr.split("\n");

          t.equal(urls[0], "/neato", "got expected first path");
          t.equal(urls[1], "/prognosis", "got expected second path");
          t.equal(urls[2], "/whoops", "got expected third path");

          t.equal(codes[0], "404", "got expected first status code");
          t.equal(codes[1], "200", "got expected second status code");
          t.equal(codes[2], "404", "got expected third status code");

          server.kill();
          t.end();
        });
      }

      function fetch() {
        get(
         {url : "http://localhost:9999/neato", json : true},
         function (e, r, body) {
           t.ifError(e, "got first request OK");
           t.deepEqual(body, {error : "notfound"}, "got 404 response");

           get(
             {url : "http://localhost:9999/prognosis", json : true},
             function (e, r, body) {
               t.ifError(e, "got second request OK");
               t.deepEqual(body, {ok : true}, "got expected (found) response");

               get(
                 {url : "http://localhost:9999/whoops", json : true},
                 function (e, r, body) {
                   t.ifError(e, "got third request OK");
                   t.deepEqual(body, {error : "notfound"}, "got 404 response");
                 }
               );
             }
           );
         }
        );
      }
    }
  };
};
