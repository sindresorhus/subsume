'use strict';
const uniqueString = require('unique-string');
const escapeStringRegexp = require('escape-string-regexp');

class Subsume {
	static parse(str, id) {
		return (new Subsume(id)).parse(str);
	}

	static parseAll(str, ids) {
		if (ids && typeof ids[Symbol.iterator] !== 'function') {
			throw new Error('ids is supposed to be an iterable');
		}
		const data = [];

		const idList = ids ? ids : Subsume.extractIDs(str);

		idList.forEach(id => {
			data[id] = Subsume.parse(str, id);
		});

		return data;
	}

	static extractIDs(str) {
		// Ideally the regex would be '@@\[(.{32})]@@(.*?)##\[\1\]##', but strict mode doesn't allow for octal escape sequences
		const idRegex = new RegExp('@@\\[(.{32})\\]@@.*?##\\[(.{32})\\]##', 'g');
		const idList = [];
		let match;

		do {
			match = idRegex.exec(str);
			if (match && match[1] === match[2]) {
				idList.push(match[1]);
			}
		} while (match);

		return idList;
	}

	constructor(id) {
		if (id && (id.includes('@@[') || id.includes('##['))) {
			throw new Error('`@@[` and `##[` cannot be used in the ID');
		}

		this.id = id ? id : uniqueString();
		this.prefix = `@@[${this.id}]@@`;
		this.postfix = `##[${this.id}]##`;
		this.regex = new RegExp(escapeStringRegexp(this.prefix) + '([\\S\\s]*)' + escapeStringRegexp(this.postfix), 'g');
	}

	compose(str) {
		return this.prefix + str + this.postfix;
	}

	parse(str) {
		const ret = {};

		ret.rest = str.replace(this.regex, (m, p1) => {
			if (p1) {
				ret.data = p1;
			}

			return '';
		});

		return ret;
	}
}

module.exports = Subsume;
