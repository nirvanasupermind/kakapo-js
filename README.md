# kakapo-js
Kakapo is a Javascript parser combinator library designed for creating complex grammars. Kakapo is an API, not a code generation tool.
![Image of Kakapo](https://images.immediate.co.uk/production/volatile/sites/4/2019/07/GettyImages-128069181-c-a9ad915.jpg)
<br>
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
console.log(parser.parse("bob")); //=> { error: { index: 1 } }
```
## kakapo.failure(index)
Generates an object of the form `{"error":{"index":index}}`. Used in [kakapo.Parser(fn)](#kakapoparserfn).
### Example
```js
console.log(kakapo.failure(2)); //=> { error: { index: 2 } }
```
## kakapo.int
Matches a signed integer literal.
### Example
```js
console.log(kakapo.int.parse("-9")); //=> "-9"
console.log(kakapo.int.parse("08")); //=> { error: { index: 1 } }
console.log(kakapo.int.parse("a")); //=> { error: { index: 0 } }
```




## kakapo.Parser(fn)
Creates a primitive parser.
### Example
```js
var parser = new kakapo.Parser(function (input) {
   if(input === "a") {
       return "foo";
   } else if(input === "b") {
       return "bar";
   } else {
       return kakapo.failure(0);
   }
});

console.log(parser.parse("a")); //=> "foo"
console.log(parser.parse("b")); //=> "bar"
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

## kakapo.uint
Matches an unsigned integer literal.
### Example
```js
console.log(kakapo.uint.parse("60")); //=> "60"
console.log(kakapo.uint.parse("a")); //=> { error: { index: 0 } }
```


## Parser methods
### parser.not()
Returns a new parser which succeeds only if `parser`a fails to match. Outputs the input text.

#### Example
```js
var parser = kakapo.text("quux").not();
console.log(parser.parse("z")); //=> "z"
console.log(parser.parse("quux")); //=> { error: { index: 3 } }

```
# Minification
For convenience I am providing a minified/obfuscated version `src/kakapo.min.js` that is being generated with uglify.js.

# License
Kakapo is licensed under the MIT License.


