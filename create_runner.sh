#!/usr/bin/env bash

# Create a runner for some js-lisp command argument.

my_file="// This file is a runner for $1.txt.\n"
my_file+="var fs = require('fs');\n"
my_file+="var jslisp = require('./js_lisp_4');\n"
my_file+="var global_scope = jslisp.global_scope;\n"
my_file+="fs.readFile('$1.txt', 'utf8', function (err, t) {\n"
my_file+="    // We just wrap with do.\n"
my_file+="    t = '(do ' + t + ')';\n"
my_file+="    var pre_ast = jslisp.parse(jslisp.tokenize(t));\n"
my_file+="    var ast = jslisp.transform_list(pre_ast);\n"
my_file+="    global_scope.eval(ast);\n"
my_file+="});\n"

echo $my_file > "$1_runner.js"