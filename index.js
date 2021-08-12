import uniqueString from 'unique-string';
import escapeStringRegexp from 'escape-string-regexp';

export default class Subsume {
	static parse(text, id) {
		return (new Subsume(id)).parse(text);
	}

	static parseAll(text, ids) {
		if (ids && !Array.isArray(ids)) {
			throw new TypeError('IDs is supposed to be an array');
		}

		const result = {data: new Map(), rest: text};
		const idList = ids ? ids : Subsume._extractIDs(text);

		if (!ids) {
			try {
				Subsume._checkIntegrity(text);
			} catch (error) {
				throw new Error(`Could not parse because the string's integrity is compromised: ${error.message}`);
			}
		}

		for (const id of idList) {
			if (result.data.get(id)) {
				throw new Error('IDs aren\'t supposed to be repeated at the same level in a string');
			}

			const parseResult = Subsume.parse(result.rest, id);
			result.data.set(id, parseResult.data);
			result.rest = parseResult.rest;
		}

		return result;
	}

	static _extractIDs(text) {
		try {
			Subsume._checkIntegrity(text);
		} catch (error) {
			throw new Error(`Could not extract IDs because the string's integrity is compromised: ${error.message}`);
		}

		const idRegex = /@@\[(.{32})]@@.*##\[\1]##/g;
		const idList = [];
		let match;

		do {
			match = idRegex.exec(text);
			if (match) {
				const [, id] = match;
				idList.push(id);
			}
		} while (match);

		return idList;
	}

	static _checkIntegrity(text) {
		const delimiterRegex = /([#|@])\1\[(.{32})]\1{2}/g;
		const ids = new Map();
		const idStack = [];
		let match;

		do {
			match = delimiterRegex.exec(text);

			if (match) {
				const [, embedToken, id] = match;

				if (embedToken === '@') {
					let map = ids;
					for (const element of idStack) {
						map = map.get(element);
					}

					if (map.get(id)) {
						throw new Error('There are duplicate IDs in the same scope.');
					}

					map.set(id, new Map());

					idStack.push(id);
				} else {
					idStack.pop();
				}
			}
		} while (match);

		if (idStack.length > 0) {
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

	compose(text) {
		return this.prefix + text + this.postfix;
	}

	parse(text) {
		try {
			Subsume._checkIntegrity(text);
		} catch (error) {
			throw new Error(`Could not extract IDs because the string's integrity is compromised: ${error.message}`);
		}

		const returnValue = {};

		returnValue.rest = text.replace(this.regex, (m, p1) => {
			if (p1) {
				returnValue.data = p1;
			}

			return '';
		});

		return returnValue;
	}
}
