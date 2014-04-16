var wambar = require('./index').createSession();

var graph = wambar('[ osc#osc1 -> eq, osc#osc2 -> eq, osc#osc3 -> eq ] -> osc');

console.log(graph);