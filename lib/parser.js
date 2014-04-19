module.exports = function parse(session, source) {

	var tokens = source.split(/([\+\-]?[0-9]+(?:\.[0-9]+)?|=|\[|\]|\(|\)|#[\w-]+|[a-z][\w-]+|\-\>|,)/i)
					   .filter(function(tok) { return !tok.match(/^\s*$/); } );

	tokens.push('§EOS');

	var exports = {};

	var pos = 0;

	return {
		graph 		: parsePipeline(),
		exports 	: exports
	};

	function at(tok) {
		var curr = tokens[pos];
		if (tok === 'node-id') {
			return curr.charAt(0) === '#';
		} else if (tok === 'ident') {
			return curr.match(/^[a-z]/i);
		} else if (tok === 'number') {
			return curr.match(/^[+-]?[0-9]/);
		} else {
			return curr === tok;
		}
	}

	function next() {
		return tokens[pos++];
	}

	function accept(tok) {
		if (!at(tok)) {
			throw new Error("parse error, expected: " + tok + ", actual: " + tokens[pos]);
		} else {
			return next();
		}
	}

	function parsePipeline() {

		var pipeline = session.createNode('pipeline');

		pipeline.add(parseExpression());
		while (at('->')) {
			next();
			pipeline.add(parseExpression());
		}

		pipeline.seal();

		return pipeline;

	}

	function parseExpression() {
		if (at('[')) {
			return parseSubmix();
		} else {
			return parseNode();
		}
	}

	function parseSubmix() {

		var channels = [];

		accept('[');
		while (true) {
			channels.push(parsePipeline());
			if (at(',')) {
				next();
			} else {
				break;
			}
		}
		accept(']');

		var mixer = session.createNode('mixer', {
			inputs: channels.length
		});

		// TODO: connect all channels

		return mixer;
	
	}
	
	function parseNode() {

		var type	= accept('ident');
		var id 		= at('node-id') ? accept('node-id').substring(1) : null;
		var args 	= at('(') ? parseArgs() : {};

		var node = session.createNode(type, args);
		if (id) {
			exports[id] = node;
		}

		return node;

	}

	function parseArgs() {

		var args = {};

		accept('(');
		while (!at(')')) {
			var key = accept('ident');
			accept('=');
			args[key] = parseValue();
			if (at(',')) {
				next();
			} else {
				break;
			}
		}
		accept(')');

		return args;

	}

	function parseValue() {
		if (at('ident')) {
			var v = next();
			if (v === 'false') return false;
			if (v === 'true')  return true;
			return v;
		} else if (at('number')) {
			return parseFloat(next());
		} else {
			throw new Error("expected: ident or number");
		}
	}

}
