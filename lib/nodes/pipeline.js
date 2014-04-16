module.exports = function(ctx, opts) {
	return new Pipeline(ctx, opts);
}

function Pipeline(ctx, opts) {
	this.type = 'pipeline';
}

Pipeline.prototype.add = function(node) {

}