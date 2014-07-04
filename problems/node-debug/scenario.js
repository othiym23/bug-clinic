var request = require("http").request;

var body = "<html><head><title>hi</title></head><body><p>yo</p></body></html>";
var contentType = "text/html";

var headers = {
  host : "localhost",
  port : 9876,
  method : "GET",
  headers : {
    "content-type"   : contentType,
    "content-length" : body.length,
    "served-by"      : "Express"
  }
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
