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