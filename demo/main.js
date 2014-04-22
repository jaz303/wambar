window.wambar = require('../');

window.init = function() {

	var ctx = new window.webkitAudioContext();
	var session = wambar.createSession(ctx);

	var graph = document.getElementById('graph');
	var button = document.getElementById('go');

	button.addEventListener('click', function() {

		var instance = session(graph.value);

		var first = instance.graph.nodes[0];
		if (first.start) {
			first.start(0);
		}

		console.log(instance);

	});

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
