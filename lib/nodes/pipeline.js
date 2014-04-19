var Node = require('../Node');

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
