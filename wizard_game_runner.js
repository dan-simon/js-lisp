// This file is a runner for wizard_game.txt.
var fs = require('fs');
var jslisp = require('./js_lisp_4');
var global_scope = jslisp.global_scope;
var show_prompt = function () {process.stdin.write('>>> ')}
var stdin = process.openStdin();
fs.readFile('wizard_game.txt', 'utf8', function (err, t) {
 // We just wrap with do.
 t = '(do ' + t + ')';
 var pre_ast = jslisp.parse(jslisp.tokenize(t));
 var ast = jslisp.transform_list(pre_ast);
 global_scope.eval(ast);
 var m = new jslisp.IntString('main');
 if (!(global_scope['has?'](m))) {
 throw 'no main function!';
 }
 var main_f = global_scope.get(m);
 show_prompt();
 stdin.addListener('data', function (d) {
 try {
 d = d.toString();
 main_f.call(new jslisp.List([
 new jslisp.IntString(d.slice(0, -1))]));
 show_prompt();
 } catch (e) {
 console.log('There was an exception:');
 console.log(e);
 }
 });
});

