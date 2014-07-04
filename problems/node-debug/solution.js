var request = require("http").request;

var headers = {
  host : "localhost",
  port : 9876,
  method : "GET"
};

var yolo = request(headers, function (res) {
  res.setEncoding("utf8");
  res.on("data", function (data) {
    console.log("BODY: " + data);
  });

  res.on("end", function () {
    console.error("done!");
  });
});

yolo.end();
