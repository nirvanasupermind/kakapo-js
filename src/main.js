var kakapo = require("./kakapo.js");
var util = require("util");

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

function main() {
  var parser = kakapo.text("Hello World");
  console.log(kakapo.uint.parse("60")); //=> "60"
console.log(kakapo.uint.parse("-100")); //=> { error: { index: 0 } }
console.log(kakapo.uint.parse("a")); //=> { error: { index: 0 } }
}

main();