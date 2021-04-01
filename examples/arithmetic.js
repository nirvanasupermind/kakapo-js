/**
 * This parser supports basic math with + - * / %.
 * It outputs an S-expression.
 * Does not support braces or negative numbers (yet).
 */

//Import kakapo
var kakapo = require("../src/kakapo.js");
// Defines a grammar for basic arithmetic 
var g = new (function () {
    var self = this;
    //A floating-point literal, with no sign.
    this.float = new kakapo.Parser(function (input) {
        //In this case, we will use a hand-built parser using regex,
        //since it is faster.
        var re = /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/;
        if (!re.test(input)) {
            //Manually compute the error index
            var index = 0;
            while (!Number.isNaN(+input.substring(0, index)) && index < input.length) {
                index++;
            }

            index--;
            return kakapo.failure(index);
        } else {
            return kakapo.success(Number(input), 0, input.length);
        }
    })

    // Recursive definition of a expression in parantheses.
    // this.parenExpr = kakapo.delay(() => kakapo.text("(")
    //                                     .then(self.expr)
    //                                     .then(kakapo.text(")"))
    //                                     .transform((results) => results[0][1]));

    //A modulo term.
    this.modTerm = this.float;

    //A division term.
    this.divTerm = this.modTerm.delimited(kakapo.text("%"))
        .transform((results) => results.length === 1 ? results[0] : ["%"].concat(results))

    //A multiplication term.
    this.mulTerm = this.divTerm.delimited(kakapo.text("/"))
        .transform((results) => results.length === 1 ? results[0] : ["/"].concat(results));
    //A subtraction term.
    this.subTerm = this.mulTerm.delimited(kakapo.text("*"))
        .transform((results) => results.length === 1 ? results[0] : ["*"].concat(results));

    //An addition term.
    this.addTerm = this.subTerm.delimited(kakapo.text("-"))
        .transform((results) => results.length === 1 ? results[0] : ["-"].concat(results));

    //Main entry point.
    this.expr = self.addTerm.delimited(kakapo.text("+")).transform((results) => results.length === 1 ? results[0] : ["+"].concat(results));



})();

//Driver code
function main() {
    var str = "8%3+1";
    console.log(g.expr.parse(str));
}

main();