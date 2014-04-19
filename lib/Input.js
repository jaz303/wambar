module.exports = Input;

function Input(name, nativeNode, ix) {
	this.name = name;
	this._nativeNode = nativeNode;
	this._ix = ix;
}
