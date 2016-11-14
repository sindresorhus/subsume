'use strict';
const uniqueString = require('unique-string');
const escapeStringRegexp = require('escape-string-regexp');

class Subsume {
	static parse(str, id) {
		return (new Subsume(id)).parse(str);
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
