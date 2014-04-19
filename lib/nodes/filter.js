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