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