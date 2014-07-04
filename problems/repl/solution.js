module.exports = scenario;

var replify = require("replify");

function scenario(callback) {
  var createServer = require("http").createServer;
  var server = createServer();

  server.__message = "REPLs are neat";
  var repl = replify({name : "bug-clinic"}, server);

  server.listen(8080, function () { callback(server, repl); });
}
