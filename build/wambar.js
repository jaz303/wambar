!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.wambar=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var utils = _dereq_('audio-buffer-utils');

exports.createSession   = _dereq_('./lib/session');
exports.cloneBuffer     = utils.clone;
exports.reverseBuffer   = utils.reverse;
exports.invertBuffer    = utils.invert;
exports.zeroBuffer      = utils.zero;

},{"./lib/session":14,"audio-buffer-utils":15}],2:[function(_dereq_,module,exports){
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
},{}],3:[function(_dereq_,module,exports){
module.exports = Input;

function Input(name, nativeNode, ix) {
	this.name = name;
	this._nativeNode = nativeNode;
	this._ix = ix;
}

},{}],4:[function(_dereq_,module,exports){
module.exports = Node;

var Input   = _dereq_('./Input'),
    Output  = _dereq_('./Output');

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
},{"./Input":3,"./Output":5}],5:[function(_dereq_,module,exports){
module.exports = Output;

var Connection = _dereq_('./Connection');

function Output(name, nativeNode, ix) {
	this.name = name;
	this._nativeNode = nativeNode;
	this._ix = ix;
}

Output.prototype.connect = function(input) {
	return new Connection(this, input);
}
},{"./Connection":2}],6:[function(_dereq_,module,exports){
module.exports = {
    eq      	: _dereq_('./nodes/eq'),
    filter 		: _dereq_('./nodes/filter'),
    mixer 		: _dereq_('./nodes/mixer'),
    osc     	: _dereq_('./nodes/osc'),
    output 		: _dereq_('./nodes/output'),
    pipeline	: _dereq_('./nodes/pipeline')
};
},{"./nodes/eq":7,"./nodes/filter":8,"./nodes/mixer":9,"./nodes/osc":10,"./nodes/output":11,"./nodes/pipeline":12}],7:[function(_dereq_,module,exports){
var Node = _dereq_('../Node');

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
},{"../Node":4}],8:[function(_dereq_,module,exports){
var Node = _dereq_('../Node');

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
},{"../Node":4}],9:[function(_dereq_,module,exports){
module.exports = function(ctx, opts) {
	return "MIXER";
}
},{}],10:[function(_dereq_,module,exports){
var Node = _dereq_('../Node');

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
            detune      : opts.detune,
            type        : opts.type
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
},{"../Node":4}],11:[function(_dereq_,module,exports){
var Node = _dereq_('../Node');

var Output = Node.extend({

    nodeType: 'output',

    init: function(opts) {

        this.native = this.context.destination;

        this._addInput('input', this.native, 0);

        this._freeze();
    
    }

});

module.exports = function(ctx, opts) {
    return new Output(ctx, opts);
}
},{"../Node":4}],12:[function(_dereq_,module,exports){
var Node = _dereq_('../Node');

var Pipeline = Node.extend({

	nodeType: 'pipeline',

	init: function(opts) {
		this.nodes = [];
		this._sealed = false;
	},

	// TODO: should we able to specify output/input indexes here?
	add: function(node) {

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

			var i = this.nodes[0].inputs[0],
				o = this.nodes[this.nodes.length-1].outputs[0];

			if (i) this._addInput(i, i._nativeNode, i._ix);
			if (o) this._addOutput(o, o._nativeNode, o._ix);
			
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

},{"../Node":4}],13:[function(_dereq_,module,exports){
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

},{}],14:[function(_dereq_,module,exports){
var nodeTypes 	= _dereq_('./node_types'),
	parse 		= _dereq_('./parser');

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

},{"./node_types":6,"./parser":13}],15:[function(_dereq_,module,exports){
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
(1)
});