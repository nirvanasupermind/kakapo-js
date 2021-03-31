/**
 * This parser supports basic math with + - * / %, unary negation, and,
 * square root. It outputs an S-expression.
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
    //                                     .then(")")
    //                                     .transform((results) => results[0][1]));

    //A division term.
    this.divTerm = this.float;

    //A multiplication term.
    this.mulTerm = this.divTerm.delimited(kakapo.text("/"))
        .transform((results) => results.length === 1 ? results[0] : ["/"].concat(results));
    //A subtraction term.
    this.subTerm = this.mulTerm.delimited(kakapo.text("*"))
         .transform((results) => results.length === 1 ? results[0] : ["*"].concat(results));

    //An addition term.
    this.addTerm = this.subTerm.delimited(kakapo.text("-"))
        .transform((results) => results.length === 1 ? results[0] : ["-"].concat(results));


})();


//Driver code
function main() {
    var str = "2-3";
    console.log(g.subTerm.parse(str));
}

main();