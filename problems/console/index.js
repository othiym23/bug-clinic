var readFile = require("graceful-fs").readFile;
var resolve = require("path").resolve;

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
      var filename = args[0];
      if (!filename) {
        t.fail("must include file to verify");
        return t.end();
      }

      // TODO: stuff here
    }
  };
};
