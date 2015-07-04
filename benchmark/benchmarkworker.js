var poly = { exports: {} };
var polyasm = { exports: {} };
module = poly;
importScripts("../polyfill/webarraymath.js");
module = polyasm
importScripts("../polyfill/webarraymath-asm.js");
importScripts("benchmark.js");

onmessage = function (oEvent) {
  var module = (oEvent.data ? polyasm : poly);
  postMessage(JSON.stringify(Object.keys(module.exports)));
  Benchmark(postMessage, module.exports.ArrayMath, module.exports.Filter, module.exports.FFT);
};

