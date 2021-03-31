# kakapo-js
[![npm version](https://badge.fury.io/js/kakapo-js.svg)](https://badge.fury.io/js/kakapo-js)<br>
<a href="https://github.com/nirvanasupermind/kakapo-js"><img align="right" src="https://images.immediate.co.uk/production/volatile/sites/4/2019/07/GettyImages-128069181-c-a9ad915.jpg" alt="Kakapo" width="200" height="120"></a>
Kakapo is a Javascript parser combinator library designed for creating complex grammars. Kakapo is an API, not a code generation tool.


Kakapo has no run-time dependencies. The Kakapo module is designed to be able to be run from the browser or from Node.js. There are several examples of using Kakapo in the "examples" folder.
# Load
It can be loaded using a script tag in an HTML document for the browser
```html
<script src="https://raw.githubusercontent.com/nirvanasupermind/kakapo-js/main/src/kakapo.min.js"></script>
```
or as a Node.js module using require.
```js
var kakapo = require("kakapo.js");
```
For Node, the library is available from the npm registry.
```
$ npm install kakapo-js
```
# API
## kakapo.char(chars)
Succeeds if one of the characters are present.
### Example
```js
var parser = kakapo.char("0123456789abc");
console.log(parser.parse("a")); //=> "a"
console.log(parser.parse("bob")); //=> { error: { index: 0 } }
```

## `kakapo.delay(fn)`
Creates a parser that is defined from a function that generates the parser. This is useful for referencing parsers that haven't yet been defined, and for implementing recursive parsers.
### Example
```js
var parser1 = kakapo.delay(() => kakapo.text("a").then(parser2));
var parser2 = kakapo.text("b");
console.log(parser1.parse("ab")); //=> ["a","b"]
```

## kakapo.failure(index)
Generates an object of the form `{"error":{"index":index}}`. Used in [kakapo.Parser(fn)](#kakapoparserfn).
### Example
```js
console.log(kakapo.failure(2)); //=> { error: { index: 2 } }
```

## kakapo.success(value,start,end)
Generates an object of the form `{"value":value,"start":start,"end":end}`. Used inside [kakapo.Parser(fn)](#kakapoparserfn).
### Example
```js
console.log(kakapo.success("a",0,1)); //=> { value: 'a', start: 0, end: 1 }
```

## kakapo.Parser(fn)
Creates a primitive parser.
### Example
```js
var parser = new kakapo.Parser(function (input) {
   if(input === "a") {
       return kakapo.success("a",0,1);
   } else if(input === "b") {
       return kakapo.success("b",0,1);
   } else {
       return kakapo.failure(0);
   }
});

console.log(parser.parse("a")); //=> "a"
console.log(parser.parse("b")); //=> "b"
console.log(parser.parse("c")); //=> { error: { index: 0 } }
```

## kakapo.text(text)
Create a parser that matches the text.
### Example
```js
var parser = kakapo.text("Hello World");
console.log(parser.parse("Hello World")); //=> "Hello World"
console.log(parser.parse("nice")); //=> { error: { index: 0 } }
```

## Parser methods
### parser.delimited(delimiter)

#### Example
```js
var parser = kakapo.text("a").delimited(kakapo.text(","));
console.log(parser.parse("")); //=> []
console.log(parser.parse("a")); //=> ["a"]
console.log(parser.parse("a,a")); //=> ["a","a"]
console.log(parser.parse("b")); //=> { error: { index: 0 } }
```

### parser.oneOrMore()
Attempts to apply the parser 1 or more times.
#### Example
```js
var parser = kakapo.char("yz").oneOrMore();
console.log(parser.parse("")); //=> { error: { index: 0 } }
console.log(parser.parse("y")); //=> ["y"]
console.log(parser.parse("zy")); //=> ["z","y"]
console.log(parser.parse("wy")); //=> { error: { index: 0 } }
```

### parser.opt()
Attempts to match a parser 0 or 1 times.
#### Example
```js
var parser = kakapo.text("a").opt();
console.log(parser.parse("")); //=> ""
console.log(parser.parse("a")); //=> "a"
console.log(parser.parse("ab")); //=> { error: { index: 1 } }
```

### parser.or(other)
Returns a new parser which tries `parser` and, if it fails, tries `other`.

### Example
```js
var parser = kakapo.text("foo")
                   .or(kakapo.text("bar"));
console.log(parser.parse("foo")); //=> "foo"
console.log(parser.parse("bar")); //=> "bar"
console.log(parser.parse("baz")); //=> { error: { index: 2 } }
```

## parser.parse(input)
Parses a string. If successful, outputs the parsed result. If unsuccessful, outputs an error object of the form `{"error":{"index":index}}`.

## parser.quantified(min,max)
Attempts to apply a parser between min and max number of times inclusive. 

### Example
```js
var parser = kakapo.text("no").quantified(1,3);
console.log(parser.parse("")); //=> { error: { index: 0 } }
console.log(parser.parse("no")); //=> ["no"]
console.log(parser.parse("nono")); //=> ["no","no"]
console.log(parser.parse("nonono")); //=> ["no","no","no"]
console.log(parser.parse("nononono")); //=> { error: { index: 2 } }
console.log(parser.parse("mo")); //=> { error: { index: 0 } }
```

## parser.repeat(count)
Attempts to apply a parser a precise number of times.
### Example
```js
var parser = kakapo.text("a").repeat(2);
console.log(parser.parse("aa")); //=> ["a","a"]
console.log(parser.parse("ab")); //=> { error: { index: 1 } }
```

## parser.then(other)
Matches two parsers in order. 
### Example
```js
var parser = kakapo.text("b").then(kakapo.text("c"));
console.log(parser.parse("bc")); //=> ["b","c"]
console.log(parser.parse("bd")); //=> { error: { index: 1 } }
console.log(parser.parse("cb")); //=> { error: { index: 0 } }
```

## parser.transform(fn)
Transforms the output of `parser` with the given function.
### Example
```js
var parser = kakapo.text("050").transform(parseFloat);
console.log(parser.parse("050")); //=> 50
console.log(parser.parse("foo")); //=> { error: { index: 0 } }
```

## parser.zeroOrMore()
Attempts to apply the parser 0 or more times.
#### Example
```js
var parser = kakapo.char("ac").zeroOrMore();
console.log(parser.parse("")); //=> []
console.log(parser.parse("a")); //=> ["a"]
console.log(parser.parse("ac")); //=> ["a","c"]
console.log(parser.parse("ad")); //=> { error: { index: 1 } }
```


# Minification
For convenience I am providing a minified/obfuscated version `src/kakapo.min.js` that is being generated with uglify.js.

# License
Kakapo is licensed under the MIT License.


