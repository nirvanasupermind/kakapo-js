var kakapo = require("./kakapo.js");
var util = require("util");

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

function main() {
  var parser = kakapo.int;
  prettyPrint(parser.parse("5"));
}

main();