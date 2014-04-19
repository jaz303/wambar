(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.wambar = require('../');

window.init = function() {

	var ctx = new window.webkitAudioContext();
	var session = wambar.createSession(ctx);

	var graph = session('osc#osc(type=sine,frequency=220) -> filter#filter(type=notch) -> eq#eq');

	// wambar.macro('channel-strip', 'eq() -> eq() -> eq() -> eq() -> gain');

	// wambar.processor('bitcrusher', {
	// 	defaults: {
	// 		bitDepth: 12
	// 	},
	// 	init: function() {

	// 	},
	// 	process: function() {

	// 	}
	// });

	// var p1 = wambar('[ osc#osc1, osc#osc2, osc#osc3 ] -> output');

	// // 3 oscillators into a mixer
	// var p2 = wambar('[ osc, osc, osc ] -> output');

	// var p3 = wambar('[ osc -> filter, osc -> filter, osc -> filter ] -> output');

}

},{"../":2}],2:[function(require,module,exports){
var utils = require('audio-buffer-utils');

exports.createSession   = require('./lib/session');
exports.cloneBuffer     = utils.clone;
exports.reverseBuffer   = utils.reverse;
exports.invertBuffer    = utils.invert;
exports.zeroBuffer      = utils.zero;

},{"./lib/session":14,"audio-buffer-utils":15}],3:[function(require,module,exports){
module.exports = Connection;

function Connection(src, dest) {
	this.source = src;
	this.destination = dest;
	this._connected = false;
	this.connect();
}

Connection.prototype.isConnected = function() {
	return this._connected;
}

Connection.prototype.connect = function() {
	if (!this._connected) {
		this.source._nativeNode.connect(
			this.destination._nativeNode,
			this.source._ix,
			this.destination._ix
		);
		this._connected = true;
	}
}

Connection.prototype.disconnect = function() {
	if (this._connected) {
		this.source._nativeNode.disconnect(this.source._ix);
		this._connected = false;
	}
}
},{}],4:[function(require,module,exports){
module.exports = Input;

function Input(name, nativeNode, ix) {
	this.name = name;
	this._nativeNode = nativeNode;
	this._ix = ix;
}

},{}],5:[function(require,module,exports){
module.exports = Node;

var Input   = require('./Input'),
    Output  = require('./Output');

function Node(ctx) {
    this.context = ctx;
    this.inputs = [];
    this.outputs = [];
}

Node.extend = function(methods) {
    
    var ctor = function(ctx, opts) {
        Node.call(this, ctx);
        this.init(opts);
    }

    ctor.prototype = Object.create(Node.prototype);

    for (var k in methods) {
        Object.defineProperty(
            ctor.prototype,
            k,
            Object.getOwnPropertyDescriptor(methods, k)
        );
    }

    if (!ctor.prototype.init) {
        ctor.prototype.init = function() {};
    }

    return ctor;

}

Node.prototype._addInput = function(name, nativeNode, ix) {
    var input = new Input(name, nativeNode, ix);
    this.inputs.push(input);
    return input;
}

Node.prototype._addOutput = function(name, nativeNode, ix) {
    var output = new Output(name, nativeNode, ix);
    this.outputs.push(output);
    return output;
}

Node.prototype._addParameter = function(nativeNode, nativeName, exportedName) {
    this[exportedName || nativeName] = nativeNode[nativeName];
    // TODO: add paramater to property dictionary
}

Node.prototype._addDiscreteProperty = function(exportedName, validValues) {
    // TODO: add property to property dictionary
}

Node.prototype._freeze = function() {
    if (Object.freeze) {
        Object.freeze(this.inputs);
        Object.freeze(this.outputs);
    }
}

Node.prototype._setDefaults = function(defaults) {
    for (var k in defaults) {
        var value = defaults[k];
        if (value === void 0) {
            continue;
        }
        if (this[k] instanceof AudioParam) {
            this[k].value = value;
        } else {
            this[k] = value;
        }
    }
}
},{"./Input":4,"./Output":6}],6:[function(require,module,exports){
module.exports = Output;

var Connection = require('./Connection');

function Output(name, nativeNode, ix) {
	this.name = name;
	this._nativeNode = nativeNode;
	this._ix = ix;
}

Output.prototype.connect = function(input) {
	return new Connection(this, input);
}
},{"./Connection":3}],7:[function(require,module,exports){
module.exports = {
    eq      	: require('./nodes/eq'),
    filter 		: require('./nodes/filter'),
    mixer 		: require('./nodes/mixer'),
    osc     	: require('./nodes/osc'),
    pipeline	: require('./nodes/pipeline')
};
},{"./nodes/eq":8,"./nodes/filter":9,"./nodes/mixer":10,"./nodes/osc":11,"./nodes/pipeline":12}],8:[function(require,module,exports){
var Node = require('../Node');

var Eq = Node.extend({

	nodeType: 'eq',

	init: function(opts) {

		this.native = this.context.createBiquadFilter();
		this.native.type = 'peaking';
		
		this._addParameter(this.native, 'frequency');
		this._addParameter(this.native, 'Q');
		this._addParameter(this.native, 'gain');

		this._addInput('input', this.native, 0);
		this._addOutput('output', this.native, 0);

		this._freeze();

		this._setDefaults({
		    frequency   : opts.frequency,
		    Q           : opts.Q,
		    gain        : opts.gain
		});
	
	}
});

module.exports = function(ctx, opts) {
	return new Eq(ctx, opts);
}
},{"../Node":5}],9:[function(require,module,exports){
var Node = require('../Node');

var Filter = Node.extend({

    nodeType: 'filter',

    init: function(opts) {

        this.native = this.context.createBiquadFilter();

        this._addDiscreteProperty('type', [
            'lowpass',
            'highpass',
            'bandpass',
            'lowshelf',
            'highshelf',
            'peaking',
            'notch',
            'allpass'
        ]);
        
        this._addParameter(this.native, 'frequency');
        this._addParameter(this.native, 'Q');
        this._addParameter(this.native, 'gain');

        this._addInput('input', this.native, 0);
        this._addOutput('output', this.native, 0);

        this._freeze();

        this._setDefaults({
            type        : opts.type,
            frequency   : opts.frequency,
            Q           : opts.Q,
            gain        : opts.gain
        });

    },

    get type() {
        return this.native.type;
    },

    set type(type) {
        this.native.type = type;
    }
})

module.exports = function(ctx, opts) {
    return new Filter(ctx, opts);
}
},{"../Node":5}],10:[function(require,module,exports){
module.exports = function(ctx, opts) {
	return "MIXER";
}
},{}],11:[function(require,module,exports){
var Node = require('../Node');

var Osc = Node.extend({

	nodeType: 'osc',

	init: function(opts) {

		this.native = this.context.createOscillator();

		this._addDiscreteProperty('type', [
		    'sine',
		    'square',
		    'sawtooth',
		    'triangle',
		    'custom'
		]);
		
		this._addParameter(this.native, 'frequency');
		this._addParameter(this.native, 'detune');
		
		this._addOutput('output', this.native, 0);

		this._freeze();

		this._setDefaults({
		    frequency   : opts.frequency,
		    detune 		: opts.detune,
		    type 		: opts.type
		});
	
	},

	get type() {
		return this.native.type;
	},

	set type(type) {
		this.native.type = type;
	},

	start: function(when, offset, duration) {
		this.native.start(when, offset, duration);
	},

	stop: function(when) {
		this.native.stop(when);
	},

	setWaveTable: function(waveTable) {
		this.native.setWaveTable(waveTable);
	}

});

module.exports = function(ctx, opts) {
	return new Osc(ctx, opts);
}
},{"../Node":5}],12:[function(require,module,exports){
var Node = require('../Node');

var Pipeline = Node.extend({

	nodeType: 'pipeline',

	init: function(opts) {
		this.nodes = [];
		this._sealed = false;
	},

	// TODO: should we able to specify output/input indexes here?
	add: function(node) {

		console.log(node);

		if (this._sealed) {
			throw new Error("can't add node - pipeline is sealed!");
		}

		this.nodes.push(node);
		if (this.nodes.length > 1) {
			this.nodes[this.nodes.length-2]
				.outputs[0]
				.connect(this.nodes[this.nodes.length-1].inputs[0]);
		}
		
	},

	seal: function() {

		// TODO: if pipeline is empty create an empty gain node here
		// so pipeline can still be used

		// TODO: sealing should not be permanent. it should be possible
		// to add/remove items from a pipeline whilst it is in operation

		// TODO: if we support variable inputs/outputs for each node
		// the exposed outputs here should respect these settings

		if (this.nodes.length > 0) {
			this._addInput(this.nodes[0].inputs[0]);
			this._addOutput(this.nodes[this.nodes.length-1].outputs[0]);
		}

		this._sealed = true;

	}

});

module.exports = function(ctx, opts) {
	return new Pipeline(ctx, opts);
}

function Pipeline(ctx, opts) {
	this.nodeType = 'pipeline';
	this.nodes = [];
}

},{"../Node":5}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
var nodeTypes 	= require('./node_types'),
	parse 		= require('./parser');

module.exports = function(audioContext) {

	console.log(audioContext);

	function wambar(source) {
		return parse(wambar, source);
	}

	var sessionNodeTypes = Object.create(nodeTypes);

	// TODO: macros/custom processors
	wambar.macro = function() {};
	wambar.processor = function() {};

	wambar.createNode = function(type, options) {
		return sessionNodeTypes[type](audioContext, options || {});
	}

	return wambar;

}

},{"./node_types":7,"./parser":13}],15:[function(require,module,exports){
exports.clone   = clone;
exports.reverse = reverse;
exports.invert  = invert;
exports.zero    = zero;

function clone(inBuffer) {
    
    var outBuffer = inBuffer.context.createBuffer(
        inBuffer.numberOfChannels,
        inBuffer.length,
        inBuffer.sampleRate
    );

    for (var i = 0, c = inBuffer.numberOfChannels; i < c; ++i) {
        var od = outBuffer.getChannelData(i),
            id = inBuffer.getChannelData(i);
        od.set(id, 0);
    }
    
    return outBuffer;

}

function reverse(buffer) {
    for (var i = 0, c = buffer.numberOfChannels; i < c; ++i) {
        var d = buffer.getChannelData(i);
        Array.prototype.reverse.call(d);
    }
}

function invert(buffer) {
    for (var i = 0, c = buffer.numberOfChannels; i < c; ++i) {
        var d = buffer.getChannelData(i),
            l = buffer.length;
        while (l--) d[l] = -d[l];
    }
}

function zero(buffer) {
    for (var i = 0, c = buffer.numberOfChannels; i < c; ++i) {
        var d = buffer.getChannelData(i),
            l = buffer.length;
        while (l--) d[l] = 0;
    }
}
},{}]},{},[1])