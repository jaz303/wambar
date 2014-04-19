module.exports = Node;

var Input   = require('./Input'),
    Output  = require('./Output');

function Node(ctx) {
    this.context = ctx;
    this.inputs = [];
    this.outputs = [];
}

Node.extend = function(methods) {
    
    var ctor = function(ctx, opts) {
        Node.call(this, ctx);
        this.init(opts);
    }

    ctor.prototype = Object.create(Node.prototype);

    for (var k in methods) {
        Object.defineProperty(
            ctor.prototype,
            k,
            Object.getOwnPropertyDescriptor(methods, k)
        );
    }

    if (!ctor.prototype.init) {
        ctor.prototype.init = function() {};
    }

    return ctor;

}

Node.prototype._addInput = function(name, nativeNode, ix) {
    var input = new Input(name, nativeNode, ix);
    this.inputs.push(input);
    return input;
}

Node.prototype._addOutput = function(name, nativeNode, ix) {
    var output = new Output(name, nativeNode, ix);
    this.outputs.push(output);
    return output;
}

Node.prototype._addParameter = function(nativeNode, nativeName, exportedName) {
    this[exportedName || nativeName] = nativeNode[nativeName];
    // TODO: add paramater to property dictionary
}

Node.prototype._addDiscreteProperty = function(exportedName, validValues) {
    // TODO: add property to property dictionary
}

Node.prototype._freeze = function() {
    if (Object.freeze) {
        Object.freeze(this.inputs);
        Object.freeze(this.outputs);
    }
}