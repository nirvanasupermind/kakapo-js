"use strict";
//Kakapo namespace
var kakapo = new (function () {
    ////////////////////////////////////////////
    //HELPERS
    const MAX_VALUE = 1500;
    function getEnd(parser, input) {
        var i = 0;
        while (i < input.length && hasError(parser._(input.slice(0, i)))) {
            i++;
        }

        return i;
    }

    //taken from https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
    function clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }

    function getStart(parser, input) {
        var i = input.length - 1;
        while (i >= 0 && hasError(parser._(input.slice(0, i)))) {
            i--;
        }
        i++;
        return i;
    }

    function hasError(output) {
        return output && typeof output === 'object' && output.error;
    }



    /**
   * Generates an object of the form {"value":value,"start":start,"end":end}. 
   * @param {*} value
   * @param {number} start
   * @param {number} end 
   */
    function success(value, start, end) {
        return { "value": value, "start": start, "end": end };
    }

    /**
     * Generates an object of the form {"error":{"index":index}}. Used in Parser(_).
     * @param {number} index 
     */
    function failure(index) {
        return { "error": { "index": Number.parseFloat(index) } };
    }


    function hasError(output) {
        return output && output.error;
    }

    function repeat(parser, amount) {
        if (amount === 0) {
            //0 repeats is empty string
            return text("").transform(() => []);
        } else {
            var result = parser;
            for (var i = 0; i < amount - 1; i++) {
                result = result.then(parser);
            }

            return result.transform((results) => Array.isArray(results) ? [].concat.apply([], results) : [results])
        }
    }


    ////////////////////////////////////////////
    //PARSER
    /**
     * Creates a primitive parser.
     */
    function Parser(_) {
        this._ = _;
    }

    /**
     * Parses a string.
     * If successful, outputs the parsed AST.
     * If unsuccessful, outputs an error object of the form {"error":{"index":index}}.
     */
    Parser.prototype.parse = function (input) {
        input = "" + input; //convert the input to string
        return this._(input);
    }

    /**
     * Transforms the output of the parser with the given function.
     */
    Parser.prototype.transform = function (fn) {
        var self = this;
        return new Parser(function (input) {
            var output = self._(input);
            return (hasError(output) ? output : fn(output));
        })
    }

    /**
     * Tries each parser in order until one succeeds. 
     */
    Parser.prototype.or = function (other) {
        var self = this;
        return new Parser(function (input) {
            var out1 = self._(input);
            var out2 = other._(input);
            return (hasError(out1) ? (hasError(out2) ? failure(Math.max(out1.error.index,out2.error.index)) : out2) : out1);
        })
    }

    /**
     * Returns a new parser which succeeds only if parser fails to match. Outputs the input text.
     */
    Parser.prototype.not = function () {
        var self = this;
        return new Parser(function (input) {
            var output = self._(input);
            return (hasError(output) ? input : failure(getEnd(self, input) - 1));
        })
    }


    /**
     * Matches two parsers in order. 
     */
    Parser.prototype.then = function (other) {
        var self = this;
        return new Parser(function (input) {
            //EXAMPLE: (("a" then "b") then "c")
            var temp = getStart(self, input) - 1;
            //temp: the index where the "c" parser is valid
            //0: input="abc" - FAILURE
            //1: input="bc" - FAILURE
            //2: input="c" - MATCH
            var newInput = input.slice(0, temp)
            var t1 = self.parse(newInput);
            // console.log("*****CALLING THEN WITH ARGUMENTS: ("+[self.name,other.name]+")")
            // console.log("VARIABLES: ",{input,temp,newInput,t1},"\n");
            if (hasError(t1)) {
                return failure(getEnd(self, input) - 1);
            } else {
                var i = getEnd(self, input.slice(0, temp));
                var t2 = other.parse(input.slice(i));
                if (hasError(t2)) {
                    return { "error": { "index": t2.error.index + temp } };
                } else {
                    return [t1, t2];
                }
            }
        })
    }

    /**
     *  Attempts to apply a parser between min and max number of times inclusive. 
     */
    Parser.prototype.quantified = function (min, max = min) {
        var result = repeat(this, min);
        for (var i = min + 1; i <= max; i++) {
            result = result.or(repeat(this, i));
        }

        return result;
    }


    /**
     * Attempts to apply the parser 0 or more times.
     */
    Parser.prototype.zeroOrMore = function (max = MAX_VALUE) {
        return this.quantified(0, max);
    }

    /**
     * Attempts to apply the parser 1 or more times.
     */
    Parser.prototype.oneOrMore = function () {
        return this.quantified(1, MAX_VALUE + 1);
    }

    // /**
    //  * Attempts to match a rule 0 or 1 times. 
    //  */
    // Parser.prototype.opt = function () {
    //     return text("").or(this);
    // }


    ////////////////////////////////////////////
    //FACTORY METHODS
    /**
     * Create a parser that matches the text.
     * @param {string} text 
     */
    function text(text) {
        text = "" + text;
        return new Parser(function (input) {
            if (input === text) {
                return text;
            } else {
                //retrieve the index
                var index = input
                    .split("")
                    .filter((_, idx) => input.charAt(idx) !== text.charAt(idx));
                index = input.indexOf(index[0]);
                return failure(index);
            }
        });
    }

    /**
     * Succeeds if one of the characters are present.
     * @param {string} chars 
     */
    function char(chars) {
        chars = "" + chars; //convert to string
        var result = text(chars.charAt(0));
        for (var i = 1; i < chars.length; i++) {
            result = result.or(text(chars.charAt(i)));
        }

        return result;
    }

    /**
     * Matches an unsigned integer literal.
     */
    var uint = char("123456789")
        .then(char("0123456789").zeroOrMore())
        .transform((results) => [results[0],results[1].join("")].join(""))
        .or(text("0"));

    /**
     * Matches a signed integer literal.
     */
    var int = char("-+")
              .then(uint)
              .transform((results) => results.join(""))
              .or(uint);
    
    // /**
    //  * Matches a floating point literal.
    //  */
    // var float = char("0123456789")
    //     .oneOrMore()
    //     .transform((results) => results.join(""));

    //public API
    this.Parser = Parser;
    // this.success = success;
    this.failure = failure;
    this.text = text;
    this.char = char;
    this.uint = uint;
    this.int = int;
    // this.float = float;


})

//Module exports.
if (typeof module === "object" && module.exports) {
    module.exports = kakapo;
} else if (typeof define === "function") {
    define([], function () { return kakapo });
}