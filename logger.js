module.exports = {
	'log': function(msg)
			{
				let t = new Date().toLocaleTimeString();
				console.log(`[${t}]`, msg)
			},
	'nolog': function(msg) {}
}
