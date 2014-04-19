var Node = require('../Node');

var Osc = Node.extend({
	init: function(opts) {

	}
})

module.exports = function(ctx, opts) {
	return new Osc(ctx, opts);
}