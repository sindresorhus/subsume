import {expectType} from 'tsd';
import Subsume, {ParseResult, ParseResults} from './index.js';

const subsume = new Subsume();
new Subsume('foo'); // eslint-disable-line no-new

expectType<string>(subsume.id);
expectType<string>(subsume.prefix);
expectType<string>(subsume.postfix);
expectType<RegExp>(subsume.regex);

const text = subsume.compose('🦄');
expectType<string>(text);

const output = `some${text} random text`;

const result = subsume.parse(output);
expectType<ParseResult>(result);
expectType<string | undefined>(result.data);
expectType<string>(result.rest);

const input
	= 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
expectType<ParseResult>(
	Subsume.parse(input, '7febcd0b3806fbc48c01d7cea4ed1219'),
);

const input2
	= 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## '
	+ 'random@@[7febcd0b3806fbc48c01d7cea4ed1218]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1218]## '
	+ 'text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##';
expectType<ParseResults>(Subsume.parseAll(input2));
expectType<ParseResults>(
	Subsume.parseAll(input2, ['7febcd0b3806fbc48c01d7cea4ed1219']),
);
