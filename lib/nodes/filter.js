var Node = require('../Node');

var Filter = Node.extend({

	nodeType: 'filter',

	init: function(opts) {

		this.native = this.context.createBiquadFilter();
		this.native.type = 'peaking';
		
		this._addParameter(this.native, 'frequency');
		this._addParameter(this.native, 'Q');
		this._addParameter(this.native, 'gain');

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

		this._addInput('input', this.native, 0);
		this._addOutput('output', this.native, 0);

		this._freeze();

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