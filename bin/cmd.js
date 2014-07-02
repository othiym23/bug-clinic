var join             = require("path").join;
var resolve          = require("path").resolve;
var createReadStream = require("graceful-fs").createReadStream;
var readFileSync     = require("graceful-fs").readFileSync;
var writeFileSync    = require("graceful-fs").writeFileSync;

var minimist = require("minimist");
var mkdirp   = require("mkdirp");

// var adventure = require("adventure");
var verify = require("adventure-verify");
var showMenu = require("../lib/menu.js");

var order   = require("../data/order.json");
var dataDir = resolve(
  process.env.HOME || process.env.USERPROFILE,
  ".config/delousy"
);

var problems = {};
Object.keys(order).forEach(function (name) {
  problems[name] = require(dirFromName(name))({name : name});
});

main(minimist(process.argv.slice(2)));

var exitCode = 0;
process.on("exit", function (code) {
  /*eslint no-process-exit:0 */
  if (code === 0 && exitCode) process.exit(exitCode);
});

function main(argv) {
  mkdirp.sync(dataDir);

  if (argv.h || argv.help || argv._[0] === "help") {
    return createReadStream(resolve(__dirname, "../data/usage.txt")).pipe(process.stdout);
  }

  switch (argv._[0]) {
    case "list":
      Object.keys(order).forEach(function (name) {
          console.log(name);
      });
      break;

    case "current":
      var current = getData("current");
      console.log(current);
      break;

    case "select":
      printProblem(argv._.slice(1).join(" "));
      break;

    case "print":
      printProblem(getCurrentProblem());
      break;

    case "verify":
    case "run":
      var problem = getCurrentProblem();

      var dir = dirFromName(problem);
      var setup = require(dir)({ run: argv._[0] === "run" });
      setTimeout(function () {
        var verifier = setup.verify;
        var test = verify(null, verifier);
        if (argv._[0] === "verify") {
          test(argv._.slice(1), function (ok) {
            if (!ok) return onfail();

            onpass();
          });
        }
        else { // run
          test(argv._.slice(1), function () {}).pipe(process.stdout);
        }
      }, setup.wait || 1);

      break;

    default:
      var opts = {
        completed : getData("completed") || [],
        title     : "DELOUSY",
        names     : Object.keys(order)
      };

      if (argv.b || argv.bg){
        opts.bg = argv.b || argv.bg;
      }

      if (argv.f || argv.fg){
        opts.fg = argv.f || argv.fg;
      }

      var menu = showMenu(opts);

      menu.on("select", printProblem);
      menu.on("exit", function () {
        console.log();
        process.exit(0);
      });
  }

  function onpass () {
    console.log("# PASS");
    console.log("\nYour solution to " + current + " passed!");
    console.log(
      "\nHere's what the official solution"
      + " is if you want to compare notes:\n"
    );

    var src = readFileSync(join(dir, "solution.js"), "utf8");
    src.split("\n").forEach(function (line) {
      console.log("    " + line);
    });

    updateData("completed", function (xs) {
      if (!xs) xs = [];
      var ix = xs.indexOf(current);
      return ix >= 0 ? xs : xs.concat(current);
    });

    var completed = getData("completed") || [];

    var remaining = Object.keys(order).length - completed.length;
    if (remaining === 0) {
      console.log("You've finished all the challenges! Hooray!\n");
    }
    else {
      console.log("You have " + remaining + " challenges left.");
      console.log("Type `delousy` to show the menu.\n");
    }

    if (setup.close) setup.close();
  }

  function onfail () {
    if (setup.close) setup.close();

    console.log("# FAIL");
    console.log(
      "\nYour solution didn't match the expected output."
      + "\nTry again, or run `delousy run program.js`"
      + " to see your solution's output."
    );
    exitCode = 1;
  }

  function getCurrentProblem() {
    var data = getData("current");
    if (!data) {
      console.error(
        "ERROR: No active problem. Select a challenge from the menu."
      );
      return process.exit(1);
    }
    return data;
  }
}

function printProblem(name) {
  console.log("\n  " + Array(70).join("#"));
  console.log(center("~~  " + name + "  ~~"));
  console.log("  " + Array(70).join("#") + "\n");

  problems[name].getStatement(function (error, text) {
    if (error) throw error;

    console.log(text);
    console.log(
      "\nTo verify your program, run: " +
      "`delousy verify program.js`.\n"
    );

    updateData("current", function () { return name; });
  });
}

function updateData(name, fn) {
  var json = {};

  try {
    json = getData(name);
  }
  catch (e) {}

  var file = resolve(dataDir, name + ".json");
  writeFileSync(file, JSON.stringify(fn(json)));
}

function getData(name) {
  var file = resolve(dataDir, name + ".json");

  try {
    return JSON.parse(readFileSync(file, "utf8"));
  }
  catch (e) {}
}

function dirFromName(name) {
  return resolve(__dirname, join("..", "problems", order[name]));
}

function center (s) {
  var n = (67 - s.length) / 2;
  return "  ##" + Array(Math.floor(n)).join(" ") + s + Array(Math.ceil(n)).join(" ") + "##";
}
