var tmenu = require("terminal-menu");
var createReadStream = require("fs").createReadStream;
var resolve = require("path").resolve;
var EventEmitter = require("events").EventEmitter;

module.exports = function (opts) {
  var emitter = new EventEmitter();

  var menu = tmenu({
    width: 65,
    x: 3, y: 2,
    bg: opts.bg || "white",
    fg: opts.fg || "red"
  });

  menu.reset();

  var title = opts.title || "UNTITLED\n";
  menu.write(title + "\n");
  menu.write(Array(title.length+1).join("-") + "\n");

  (opts.names || []).forEach(function (name) {
    var isDone = (opts.completed || []).indexOf(name.split(" ")[0]) >= 0;
    var isUnfinished = false;
    if (opts.ready) {
      isUnfinished = opts.ready.indexOf(name.split(" ").shift()) === -1;
    }

    if (isUnfinished) {
      var n = "[TEXT ONLY]\n";
      menu.add(name + Array(66 - n.length - name.length + 1).join(" ") + n);
    }
    else if (isDone) {
      var m = "[COMPLETED]";
      menu.add(name + Array(65 - m.length - name.length + 1).join(" ") + m);
    }
    else menu.add(name);
  });
  menu.write("-----------------\n");
  menu.add("HELP");
  menu.add("EXIT");

  menu.on("select", function (label) {
    var name = label.replace(/\s{2}.*/, "");

    menu.close();
    if (name === "EXIT") return emitter.emit("exit");
    if (name === "HELP") {
      console.log();
      var usage = opts.usage || resolve(__dirname, "../data/usage.txt");
      return createReadStream(usage).pipe(process.stdout);
    }

    emitter.emit("select", name);
  });
  menu.createStream().pipe(process.stdout);
  emitter.close = function () { menu.close(); };

  return emitter;
};
