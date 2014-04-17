var wambar = require('./index').createSession();

var graph = wambar('[ [ osc(a=-1.23,c=true) -> osc(type=sine) -> osc ], osc#osc1 -> eq, osc#osc2 -> eq, osc#osc3 -> eq ] -> [ osc ] -> osc');

// wambar.define('channel-strip', 'osc -> filter -> lfo -> adsr');

// wambar.add('ch1', 'channel-strip');
// wambar.add('ch2', 'channel-strip');
// wambar.add('ch3', 'channel-strip');




// wambar.define('ch1');

console.log(graph);