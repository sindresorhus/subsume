import {expectType} from 'tsd';
import Subsume = require('.');
import {ParseResult, ParseResults} from '.';

const subsume = new Subsume();
new Subsume('foo');

expectType<string>(subsume.id);
expectType<string>(subsume.prefix);
expectType<string>(subsume.postfix);
expectType<RegExp>(subsume.regex);

const text = subsume.compose('🦄');
expectType<string>(text);

const output = `some${text} random text`;

const res = subsume.parse(output);
expectType<ParseResult>(res);
expectType<string | undefined>(res.data);
expectType<string>(res.rest);

const input =
	'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
expectType<ParseResult>(
	Subsume.parse(input, '7febcd0b3806fbc48c01d7cea4ed1219')
);

const input2 =
	'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## ' +
	'random@@[7febcd0b3806fbc48c01d7cea4ed1218]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1218]## ' +
	'text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##';
expectType<ParseResults>(Subsume.parseAll(input2));
expectType<ParseResults>(
	Subsume.parseAll(input2, ['7febcd0b3806fbc48c01d7cea4ed1219'])
);
