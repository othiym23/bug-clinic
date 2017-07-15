var createServer = require('http').createServer
var server = createServer(function (req, res) { res.end('hello') })
server.on('error', function (err) {
  console.error(err.stack)
  process.exit(1)
})
server.listen(9876, function () { console.log('listening') })
