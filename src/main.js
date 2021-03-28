var kakapo = require("./kakapo.js");
var util = require("util");

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

function main() {
  var parser = kakapo.text("quux").not();
  console.log(parser.parse("z")); //=> "z"
  console.log(parser.parse("quux")); //=> { error: { index: 3 } }
}

main();