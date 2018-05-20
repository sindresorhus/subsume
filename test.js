import test from 'ava';
import Subsume from './';

test('new Subsume()', t => {
	const subsume = new Subsume();
	t.is(typeof subsume.id, 'string');
	t.is(subsume.id.length, 32);
	t.true(subsume.prefix.startsWith('@@['));
	t.true(subsume.prefix.endsWith(']@@'));
	t.true(subsume.postfix.startsWith('##['));
	t.true(subsume.postfix.endsWith(']##'));
	t.truthy(subsume.regex);
});

test('new Subsume(id)', t => {
	const subsume = new Subsume('unicorn');
	t.is(subsume.id, 'unicorn');
	t.is(subsume.prefix, '@@[unicorn]@@');
});

test('Subsume.parse()', t => {
	const fixture = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
	const id = '7febcd0b3806fbc48c01d7cea4ed1219';

	t.deepEqual(Subsume.parse(fixture, id), {
		data: '🦄',
		rest: 'some random text'
	});
});

test('Subsume#compose()', t => {
	const subsume = new Subsume();
	const text = subsume.compose('🦄');
	t.true(text.includes('🦄'));
	t.is(Subsume.parse(text, subsume.id).data, '🦄');
});

test('Subsume#parse()', t => {
	const fixture = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
	const subsume = new Subsume('7febcd0b3806fbc48c01d7cea4ed1219');

	t.deepEqual(subsume.parse(fixture), {
		data: '🦄',
		rest: 'some random text'
	});
});

test('Subsume#checkIntegrity()', t => {
	const fixture1 = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
	const fixture2 = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]####[7febcd0b3806fbc48c01d7cea4ed1219]## random text';
	const fixture3 = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random @@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]##text';
	const fixture4 = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]## random @@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄text';

	t.deepEqual(Subsume.checkIntegrity(fixture1), {'7febcd0b3806fbc48c01d7cea4ed1219': {}});
	t.deepEqual(Subsume.checkIntegrity(fixture2), {'7febcd0b3806fbc48c01d7cea4ed1219': {'7febcd0b3806fbc48c01d7cea4ed1219': {}}});
	t.throws(() => Subsume.checkIntegrity(fixture3));
	t.throws(() => Subsume.checkIntegrity(fixture4));
});

test('Subsume#extractIDs()', t => {
	const fixture = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]####[7febcd0b3806fbc48c01d7cea4ed1219]## random@@[7febcd0b3806fbc48c01d7cea4ed1218]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1218]## text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##';
	t.deepEqual(Subsume.extractIDs(fixture), ['7febcd0b3806fbc48c01d7cea4ed1219', '7febcd0b3806fbc48c01d7cea4ed1218', '7febcd0b3806fbc48c01d7cea4ed1217']);
});

test('Subsume#parseAll()', t => {
	const map = new Map();
	map.set('7febcd0b3806fbc48c01d7cea4ed1219', '🦄@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]##');
	map.set('7febcd0b3806fbc48c01d7cea4ed1218', '🦄');
	map.set('7febcd0b3806fbc48c01d7cea4ed1217', '🦄');

	const fixture = 'some@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄@@[7febcd0b3806fbc48c01d7cea4ed1219]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1219]####[7febcd0b3806fbc48c01d7cea4ed1219]## random@@[7febcd0b3806fbc48c01d7cea4ed1218]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1218]## text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##';
	t.deepEqual(Subsume.parseAll(fixture), {data: map, rest: 'some random text'});

	map.delete('7febcd0b3806fbc48c01d7cea4ed1217');
	t.deepEqual(Subsume.parseAll(fixture, ['7febcd0b3806fbc48c01d7cea4ed1219', '7febcd0b3806fbc48c01d7cea4ed1218']), {data: map, rest: 'some random text@@[7febcd0b3806fbc48c01d7cea4ed1217]@@🦄##[7febcd0b3806fbc48c01d7cea4ed1217]##'});
});
