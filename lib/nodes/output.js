var Node = require('../Node');

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