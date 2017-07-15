var fs = require('fs')

var peach = function (obj) {
  console.trace('traced')
  console.log(obj)
}

var bowser = function (callback) {
  fs.readFile(process.argv[2], {encoding: 'utf8'}, callback)
}

var koopa = function (err, file) {
  if (err) return console.error('Handle your errors folks.')

  peach(JSON.parse(file))
}

bowser(koopa)
