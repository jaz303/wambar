module.exports = Output;

var Connection = require('./Connection');

function Output(name, nativeNode, ix) {
	this.name = name;
	this._nativeNode = nativeNode;
	this._ix = ix;
}

Output.prototype.connect = function(input) {
	return new Connection(this, input);
}