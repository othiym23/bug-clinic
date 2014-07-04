module.exports = {
  local : function (traces) {
    console.error("up");

    var count = 0;
    traces.on("request:start", function (trace) {
      console.log(trace.url);
    });

    traces.on("request:end", function (trace) {
      /*eslint no-process-exit:0 */
      count++;
      console.error(trace.statusCode);
      if (count === 3) process.exit(0);
    });
  }
};
