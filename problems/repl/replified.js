// in your application
var replify = require("replify");
var replpad = require("replpad");

var server = require("http").createServer(function (req, res) {
  res.end("hello");
});

replify({name : "hello-server", start : replpad}, server);

server.listen(1234, function () {
  console.log("listening");
});
