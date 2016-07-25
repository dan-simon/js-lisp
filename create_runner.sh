#!/usr/bin/env bash

# Create a runner for some js-lisp command argument.

my_file="// This file is a runner for $1.txt.\n"
my_file+="var fs = require('fs');\n"
my_file+="var jslisp = require('./js_lisp_4');\n"
my_file+="var global_scope = jslisp.global_scope;\n"
my_file+="var show_prompt = function () {process.stdin.write('>>> ')}\n"
my_file+="var stdin = process.openStdin();\n"
my_file+="fs.readFile('$1.txt', 'utf8', function (err, t) {\n"
my_file+="    var parts = t.split('\\\\n\\\\n');\n"
my_file+="    var pre_ast;\n"
my_file+="    var ast;\n"
my_file+="    for (var i = 0; i < parts.length; i++) {\n"
my_file+="        var pre_ast = jslisp.parse(jslisp.tokenize(parts[i]));\n"
my_file+="        var ast = jslisp.transform_list(pre_ast);\n"
my_file+="        global_scope.eval(ast);\n"
my_file+="    };\n"
my_file+="    var m = new jslisp.IntString('main');\n"
my_file+="    if (!(global_scope['has?'](m))) {\n"
my_file+="        throw 'no main function!';\n"
my_file+="    }\n"
my_file+="    var main_f = global_scope.get(m);\n"
my_file+="    show_prompt();\n"
my_file+="    stdin.addListener('data', function (d) {\n"
my_file+="        try {\n"
my_file+="            d = d.toString();\n"
my_file+="            main_f.call(new jslisp.List([\n"
my_file+="                new jslisp.IntString(d.slice(0, -1))]));\n"
my_file+="            show_prompt();\n"
my_file+="        } catch (e) {\n"
my_file+="            console.log('There was an exception:');\n"
my_file+="            console.log(e);\n"
my_file+="        }\n"
my_file+="    });\n"
my_file+="});\n"

echo $my_file > "$1_runner.js"