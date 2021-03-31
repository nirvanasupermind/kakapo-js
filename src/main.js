var kakapo = require("./kakapo.js");
var util = require("util");

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

//Driver code
function main() {
var parser1 = kakapo.text('ab').oneOrMore();
console.log(parser1._("abab"));
  // var parser = kakapo.text("foo")
  //   .or(kakapo.text("bar"));
  // console.log(parser.parse("foo")); //=> "foo"
  // console.log(parser.parse("bar")); //=> "bar"
  // console.log(parser.parse("baz"));

}

main();