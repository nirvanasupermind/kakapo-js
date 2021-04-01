"use strict";
var kakapo = require("./kakapo.js");
var util = require("util");

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

//Driver code
function main() {
  var parser1 = kakapo.text("ab").zeroOrMore();
  console.log(parser1.parse("abc"));
}

main();