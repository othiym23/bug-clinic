var readFile = require("graceful-fs").readFile;
var existsSync = require("graceful-fs").existsSync;
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

      var bonus = false;
      if (args[0] === "bonus") {
        bonus = true;
        filename = args[1];
      }

      if (!filename) {
        t.fail("must include file to verify");
        return t.end();
      }

      if (!existsSync(filename)) {
        t.fail("test program not found");
        t.end();
      }

      if (bonus) return runEslint(filename, t);

      runJshint(filename, t);
    }
  };
};

function runJshint(filename, t) {
  var jshintArgs = [
    require.resolve("jshint/bin/jshint"),
    "-c",
    resolve(__dirname, "./jshintrc"),
    filename
  ];

  var test = spawn("node", jshintArgs);

  var out = "", err = "";
  test.stdout.on("data", function (data) {
    out += data;
  });

  test.stderr.on("data", function (data) {
    err += data;
  });

  test.on("close", function (code) {
    t.equal(code, 0, "jshint exited correctly");
    t.equal(out.toString("utf8").trim(), "", "no lint output");
    t.equal(err.toString("utf8").trim(), "", "no lint errors");
    t.end();
  });
}

function runEslint(filename, t) {
  var eslintArgs = [
    require.resolve("eslint/bin/eslint.js"),
    "-c",
    resolve(__dirname, "./eslintrc"),
    filename
  ];

  var test = spawn("node", eslintArgs);

  var out = "", err = "";
  test.stdout.on("data", function (data) {
    out += data;
  });

  test.stderr.on("data", function (data) {
    err += data;
  });

  test.on("close", function (code) {
    t.equal(code, 0, "eslint exited correctly");
    t.equal(out.toString("utf8").trim(), "", "no lint output");
    t.equal(err.toString("utf8").trim(), "", "no lint errors");
    t.end();
  });
}
