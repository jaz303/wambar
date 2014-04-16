var wambar = require('../');

wambar.init();

wambar.macro('channel-strip', 'eq() -> eq() -> eq() -> eq() -> gain');

wambar.processor('bitcrusher', {
	defaults: {
		bitDepth: 12
	},
	init: function() {

	},
	process: function() {

	}
});

var p1 = wambar('[ osc#osc1, osc#osc2, osc#osc3 ] -> output');

// 3 oscillators into a mixer
var p2 = wambar('[ osc, osc, osc ] -> output');

var p3 = wambar('[ osc -> filter, osc -> filter, osc -> filter ] -> output');