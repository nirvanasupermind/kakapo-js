"use strict";
// Array.prototype.flat || (Array.prototype.flat = function (t, r) { return r = this.concat.apply([], this), t > 1 && r.some(Array.isArray) ? r.flat(t - 1) : r }, Array.prototype.flatMap = function (t, r) { return this.map(t, r).flat() })
//Kakapo namespace
var kakapo = new (function () {
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
     * If successful, outputs the parsed result.
     * If unsuccessful, outputs an error object of the form {"error":{"index":index}}.
     */
    Parser.prototype.parse = function (input) {
        input = String(input); //Convert the input to a string
        var t = this._(input);
        if (typeof t.value !== "undefined")
            return t.value;
        return t;
    }

    /**
     * Returns a new parser which tries parser and, if it fails, tries other.
     */
    Parser.prototype.or = function (other) {
        var self = this;
        return new Parser(function (input) {
            return hasErrors(self._(input)) ? other._(input) : self._(input);
        });
    }


    /**
     * Matches two parsers in order. 
     */
    Parser.prototype.then = function (other) {
        var self = this;
        return new Parser(function (input) {
            // console.log(self._("ab"),other._("c"));
            var i = 0;
            while (i < input.length && hasErrors(other._(input.substring(i)))) {
                i++;
            }


            var t1 = self._(input.substring(0, i));
            var t2 = other._(input.substring(i));

            if (hasErrors(t1))
                return t1;
            if (hasErrors(t2))
                return failure(t2.index + i);
            return success([t1.value, t2.value], t1.start, t2.end + i);
        })
    }


    /**
     * Attempts to apply a parser between min and max number of times inclusive. 
    */
    Parser.prototype.quantified = function (min, max) {
        var result = repeat(this, min);
        for (var i = min + 1; i <= max; i++) {
            result = result.or(repeat(this, i));
        }

        return result;
    }

    /** 
     * Attempts to apply a parser a precise number of times.
    */
    Parser.prototype.repeat = function (count) {
        return this.quantified(count, count);
    }

    /** 
    * Attempts to match a parser 0 or 1 times.
    */
    Parser.prototype.opt = function (count) {
        return text("").or(this);
    }


    function mergeReplies(result, last) {
        if (!last) {
            return result;
        }

        if (result.end > last.end || hasErrors(result)) {
            return result;
        } else {
            return success(result.value, result.start, last.end);
        }
    }

    function getAllSubstrings(str) {
        var i, j, result = [];

        for (i = 0; i < str.length; i++) {
            for (j = i + 1; j < str.length + 1; j++) {
                result.push(str.slice(i, j));
            }
        }
        return result;
    }

    function substrParser(parser, str) {
        for (var i = 0; i < getAllSubstrings(str).length; i++) {
            var substr = getAllSubstrings(str)[i];
            if (!hasErrors(parser._(substr))) {
                return parser._(substr);
            }
        }

        return parser._(substr);
    }

    function substrParser(parser, str) {
        for (var i = 0; i < getAllSubstrings(str).length; i++) {
            var substr = getAllSubstrings(str)[i];
            if (!hasErrors(parser._(substr))) {
                return parser._(substr);
            }
        }

        return parser._(substr);
    }

    function antiSubstrParser(parser, str) {
        for (var i = 0; i < getAllSubstrings(str).length; i++) {
            var substr = getAllSubstrings(str)[i];
            if (hasErrors(parser._(substr))) {
                return parser._(substr);
            }
        }

        return false;
    }




    /** 
    * Attempts to apply the parser 1 or more times.
    */
    Parser.prototype.oneOrMore = function () {

        //example: this=text("a")
        var self = this;
        return this.then(this).or(new Parser(function (input) {
            //input="": []
            //input="a": ["a"]
            //input="aaa": ["a","a","a"]
            //input="b": {"error":{"index":0}}
            var accum = [];
            var result = undefined;
            var count = 0;

            var start = 0;
            var end = 0;
            var i = 0;
            while (true) {
                // console.log("***count="+count);
                //count=0
                count++;
                if (count > 5000) {
                    throw "infinite loop";
                }



                // prevResult = Object.assign({}, result);
                result = self._(input.substring(i));
                if (count === 0 && !hasErrors(result)) {
                    start = result.start;
                }

                //result = parsingFunction("aaa") = {"error":{"index":1}}.
                //"aa"
                if (hasErrors(result)) {
                    // idx = result.error.index;
                    // if (idx >= input.length) { break; }
                    i = result.error.index;
                    // console.log(i,i+count);
                    if (i + count > input.length + 1) { break; }
                    var temp = self._(input.substring(0, i));
                    if (hasErrors(temp)) { return failure(temp.error.index + count - 1); }

                    end += temp.end;
                    accum.push(temp.value);
                } else {
                    end += result.end;
                    return success([result.value], result.start, result.end);
                }
            }

            return success(accum, start, end);
        }))
    }

    /** 
    * Attempts to apply the parser 0 or more times.
    */
    Parser.prototype.zeroOrMore = function () {
        return this.oneOrMore().or(text("").transform(() => []))
    }

    /**
     * Transforms the output of the parser with the given function.
    */
    Parser.prototype.transform = function (fn) {
        var self = this;
        return new Parser(function (input) {
            var output = self._(input);
            return (hasErrors(output) ? output : success(fn(output.value), output.start, output.end));
        })
    }

    /**
     * Repeats a parser zero or more times, with a delimiter between each one. 
     */
    Parser.prototype.delimited = function (delimiter) {
        return this.then(delimiter.then(this).zeroOrMore())
            .transform((results) => [results[0], ...results[1].map((e) => e[1])])
    }

    ////////////////////////////////////////////
    //FACTORY METHODS
    /**
     * Creates a parser that is defined from a function that generates the parser. 
     * This allows two rules to have a cyclic relation. 
     * @param {function} fn 
     */
    function delay(fn) {
        var parser = new kakapo.Parser(function (input) {
            parser._ = fn()._;
            return parser._(input);
        });

        return parser;
    }
    /**
     * Create a parser that matches the text.
     * @param {string} text 
     */
    function text(text) {
        text = String(text); //make the text a string
        return new Parser(function (input) {
            if (input === text) {
                return success(text, 0, text.length);
            } else {
                //extract the index
                var i = 0;
                while (input.charAt(i) === text.charAt(i) && i < Math.max(input.length, text.length)) {
                    i++;
                }

                return failure(i);
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



    ////////////////////////////////////////////
    //HELPERS
    const MAX_VALUE = 11;

    /**
     * Returns the object {"value":value,"start":start,"end":end}. Used inside Parser(_).
     * @param {*} value 
     * @param {number} start 
     * @param {number} end 
     */
    function success(value, start, end) {
        return { "value": value, "start": parseFloat(start), "end": parseFloat(end) };
    }

    /**
     * Returns the object {"error":{"index":index}}. Used inside Parser(_).
     */
    function failure(index) {
        return { "error": { "index": parseFloat(index) } };
    }

    function hasErrors(o) {
        return o && o.error && !o.value;
    }

    function repeat(a, b) {
        if (b === 0) {
            return text("").transform(() => []);
        } else if (b === 1) {
            return a.transform((results) => [results]);
        } else {
            var result = a.then(a);
            for (var i = 2; i < b; i++) {
                result = result.then(a).transform((results) => [...results[0], ...results.slice(1)]);
            }

            return result;
        }
    }



    this.Parser = Parser;
    this.text = text;
    this.char = char;
    this.success = success;
    this.failure = failure;
    this.delay = delay;
    // this.substrParser = substrParser;
})();

//Module exports.
if (typeof module === "object" && module.exports) {
    module.exports = kakapo;
} else if (typeof define === "function") {
    define([], function () { return kakapo });
}