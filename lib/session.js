var nodeTypes 	= require('./node_types'),
	parse 		= require('./parser');

module.exports = function(audioContext) {

	console.log(audioContext);

	function wambar(source) {
		return parse(wambar, source);
	}

	var sessionNodeTypes = Object.create(nodeTypes);

	// TODO: macros/custom processors
	wambar.macro = function() {};
	wambar.processor = function() {};

	wambar.createNode = function(type, options) {
		return sessionNodeTypes[type](audioContext, options || {});
	}

	return wambar;

}
