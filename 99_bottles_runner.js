// This file is a runner for 99_bottles.txt.
var fs = require('fs');
var jslisp = require('./js_lisp_4');
var global_scope = jslisp.global_scope;
fs.readFile('99_bottles.txt', 'utf8', function (err, t) {
 // We just wrap with do.
 t = '(do ' + t + ')';
 var pre_ast = jslisp.parse(jslisp.tokenize(t));
 var ast = jslisp.transform_list(pre_ast);
 global_scope.eval(ast);
});

