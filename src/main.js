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
var parser = kakapo.char("ac").zeroOrMore();
console.log(parser.parse("")); //=> []
console.log(parser.parse("a")); //=> ["a"]
console.log(parser.parse("ac")); //=> ["a","c"]
console.log(parser.parse("ad")); //=> { error: { index: 1 } }
}

main();