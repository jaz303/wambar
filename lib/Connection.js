module.exports = Connection;

function Connection(src, dest) {
	this.source = src;
	this.destination = dest;
	this._connected = false;
	this.connect();
}

Connection.prototype.isConnected = function() {
	return this._connected;
}

Connection.prototype.connect = function() {
	if (!this._connected) {
		this.source._nativeNode.connect(
			this.destination._nativeNode,
			this.source._ix,
			this.destination._ix
		);
		this._connected = true;
	}
}

Connection.prototype.disconnect = function() {
	if (this._connected) {
		this.source._nativeNode.disconnect(this.source._ix);
		this._connected = false;
	}
}