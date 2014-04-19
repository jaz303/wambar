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
