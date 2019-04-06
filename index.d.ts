declare namespace Subsume {
	interface ParseResult {
		data?: string;
		rest: string;
	}

	interface ParseResults {
		data: Map<string, string>;
		rest: string;
	}
}

declare class Subsume {
	/**
	Extract embedded data with a specific `id` out of `text`.

	Useful when `text` comes from an external source.
	*/
	static parse(text: string, id: string): Subsume.ParseResult;

	/**
	Extract embedded data corresponding to all IDs in `idArray`, if specified. Otherwise it will extract embedded data for all top-level IDs.

	@returns An object with a Map with an entry for each parsed ID, and a rest string for what remains after all the required IDs have been parsed, as seen below:

	The input:

	```
	some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random@@[7febcd0b3806fbc48c01d7cea4ed1218]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1218]## text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##
	```

	Gives the following output:

	```
	{
		data: Map {
			'7febcd0b3806fbc48c01d7cea4ed1219' => '🦄',
			'7febcd0b3806fbc48c01d7cea4ed1218' => '🦄',
			'7febcd0b3806fbc48c01d7cea4ed1217' => '🦄'
		},
		rest: 'some random text'
	}
	```
	*/
	static parseAll(text: string, idArray?: string[]): Subsume.ParseResults;

	/**
	Used identifier.
	*/
	id: string;

	/**
	Prefix used in `.compose()`.
	*/
	prefix: string;

	/**
	Postfix used in `.compose()`.
	*/
	postfix: string;

	/**
	Regex used in `.parse()`.
	*/
	regex: RegExp;

	/**
	Embed data in other data and easily extract it when needed.

	@param id - You probably don't need to set this. Can be useful if you need a stable ID.

	@example
	```
	import Subsume = require('subsume');

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
	*/
	constructor(id?: string);

	/**
	@returns A wrapped version of `text` that you can embed in other content.
	*/
	compose(text: string): string;

	/**
	Extract your embedded data from `text`.

	@returns an object with properties `.data` for your embedded data and `.rest` for everything else.
	*/
	parse(text: string): Subsume.ParseResult;
}

export = Subsume;
