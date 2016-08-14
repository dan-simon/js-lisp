// This file is an interactive runner.
var file_name = process.argv[2];
var fs = require('fs');
var jslisp = require('./js_lisp_5');
var global_scope = jslisp.global_scope;
var show_prompt = function () {process.stdin.write('>>> ')}
var stdin = process.openStdin();
fs.readFile(file_name, 'utf8', function (err, t) {
    if (err !== null) {
        throw err;
    }
    // We just wrap with do.
    t = '(do ' + t + ')';
    var pre_ast = jslisp.parse(jslisp.tokenize(t));
    var ast = jslisp.transform_list(pre_ast);
    global_scope.eval(ast);
    var m = new jslisp.IntString('main');
    var p = new jslisp.IntString('prompt');
    var main_f = global_scope.get(m);
    var pr = global_scope.get(p);
    var show_prompt = function () {
        try {
            var p_val = pr.call(new jslisp.List([]))
            if (!(p_val instanceof jslisp.IntString)) {
                throw '(prompt) must be a string.'
            }
            process.stdin.write(p_val.s);
        } catch (e) {
            console.log('There was an exception:');
            console.log(e);
        }
    }
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

