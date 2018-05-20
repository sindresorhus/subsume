'use strict';
const uniqueString = require('unique-string');
const escapeStringRegexp = require('escape-string-regexp');

class Subsume {
	static parse(str, id) {
		return (new Subsume(id)).parse(str);
	}

	static parseAll(str, ids) {
		if (ids && typeof ids[Symbol.iterator] !== 'function') {
			throw new Error('IDs is supposed to be an iterable');
		}
		const result = {data: new Map(), rest: str};
		const idList = ids ? ids : Subsume.extractIDs(str);

		if (!ids) {
			try {
				Subsume.checkIntegrity(str);
			} catch (err) {
				throw new Error('Could not parse because the string\'s integrity is compromised: ' + err);
			}
		}

		idList.forEach(id => {
			if (result.data.get(id)) {
				throw new Error('IDs aren\'t supposed to be repeated at the same level in a string');
			}
			const res = Subsume.parse(result.rest, id);
			result.data.set(id, res.data);
			result.rest = res.rest;
		});

		return result;
	}

	static extractIDs(str) {
		try {
			Subsume.checkIntegrity(str);
		} catch (err) {
			throw new Error('Could not extract IDs because the string\'s integrity is compromised: ' + err);
		}
		const idRegex = new RegExp('@@\\[(.{32})\\]@@.*##\\[(\\1)\\]##', 'g');
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

	static checkIntegrity(str) {
		const delimiterRegex = new RegExp('([#|@])(?:\\1)\\[(.{32})\\](?:\\1){2}', 'g');
		const ids = {};
		const idStack = [];
		let match;

		do {
			match = delimiterRegex.exec(str);
			if (match) {
				if (match[1] === '@') {
					let arr = ids;
					idStack.forEach(el => {
						arr = arr[el];
					});
					if (arr[match[2]]) {
						throw new Error('There\'re duplicate IDs in the same scope.');
					}
					arr[match[2]] = {};
					idStack.push(match[2]);
				} else {
					idStack.pop();
				}
			}
		} while (match);

		if (idStack.length !== 0) {
			throw new Error('There is a mismatch between prefixes and suffixes');
		}
		return ids;
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
		try {
			Subsume.checkIntegrity(str);
		} catch (err) {
			throw new Error('Could not extract IDs because the string\'s integrity is compromised: ' + err);
		}
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
