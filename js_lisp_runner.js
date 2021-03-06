// This file is a runner.
var file_name = process.argv[2];
var fs = require('fs');
var jslisp = require('./js_lisp_5');
var global_scope = jslisp.global_scope;
fs.readFile(file_name, 'utf8', function (err, t) {
	if (err !== null) {
        throw err;
    }
    // We just wrap with do.
    t = '(do ' + t + ')';
    var pre_ast = jslisp.parse(jslisp.tokenize(t));
    var ast = jslisp.transform_list(pre_ast);
    try {
    	global_scope.eval(ast);
    } catch (e) {
    	console.log('There was an exception: ');
    	console.log(e);
    }
});

