# subsume

> Embed data in other data and easily extract it when needed

Can for example be useful when you run a child process that has multiple entities writing to stdout and you want to handle those outputs differently. I personally use it in [`run-jxa`](https://github.com/sindresorhus/run-jxa) to allow the code run in that context to use `console.log`, but also allow me to send the result of the execution back through `console.log`.

## Install

```
$ npm install subsume
```

## Usage

```js
import Subsume from 'subsume';

const subsume = new Subsume();

console.log(subsume.id);
//=> '7febcd0b3806fbc48c01d7cea4ed1219'

const text = subsume.compose('🦄');
//=> '@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]##'

// The text can now be embedded in some other text
const output = `some${text} random text`;
//=> 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text'

// At a later point we extract it
subsume.parse(output);
//=> {data: '🦄', rest: 'some random text'}

// Or in a different process by using the `id`
const input = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
Subsume.parse(text, '7febcd0b3806fbc48c01d7cea4ed1219');
//=> {data: '🦄', rest: 'some random text'}
```

## API

### `subsume = new Subsume(id?)`

Returns a new instance.

#### id

Type: `string`\
Default: Unique ID

You probably don't need to set this. Can be useful if you need a stable ID.

### subsume

`Subsume` instance.

#### compose(text)

Type: `Function`

Returns a wrapped version of `text` that you can embed in other content.

#### parse(text)

Type: `Function`

Extract your embedded data from `text`.

Returns an object with properties `.data` for your embedded data and `.rest` for everything else.

#### id

Type: `string`

The used identifier.

#### prefix

Type: `string`

Prefix used in `.compose()`.

#### postfix

Type: `string`

Postfix used in `.compose()`.

#### regex

Type: `RegExp`

Regex used in `.parse()`.

### Subsume.parse(text, id)

Extract embedded data with a specific `id` out of `text`.

Useful when `text` comes from an external source.

### Subsume.parseAll(text, idArray?)

Extract embedded data corresponding to all IDs in `idArray`, if specified. Otherwise it will extract embedded data for all top-level IDs.

Returns an object with properties `.data`, a Map with an entry for each parsed ID, and `.rest` for what remains after all the required IDs have been parsed, as seen below:

The input:

```
some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random@@[7febcd0b3806fbc48c01d7cea4ed1218]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1218]## text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##
```

Gives the following output:

```js
{
	data: Map {
		'7febcd0b3806fbc48c01d7cea4ed1219' => '🦄',
		'7febcd0b3806fbc48c01d7cea4ed1218' => '🦄',
		'7febcd0b3806fbc48c01d7cea4ed1217' => '🦄'
	},
	rest: 'some random text'
}
```
