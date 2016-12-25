var js_lisp_types = require('./js_lisp_types_5');

var IntNumber = js_lisp_types.IntNumber;
var IntString = js_lisp_types.IntString;
var IntFunction = js_lisp_types.IntFunction;
var Hash = js_lisp_types.Hash;
var List = js_lisp_types.List;
var check_one_arg = js_lisp_types.check_one_arg;
var max_fn_args = js_lisp_types.max_fn_args;

// math object start

var builtin_math = new Hash();

var math_consts = ['E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI', 'SQRT1_2'];

var math_funcs = [
    ['acos', 1],
    ['acosh', 1],
    ['asin', 1],
    ['asinh', 1],
    ['atan', 1],
    ['atanh', 1],
    ['atan2', 2],
    ['cbrt', 1],
    ['clz32', 1],
    ['cos', 1],
    ['cosh', 1],
    ['exp', 1],
    ['expm1', 1],
    ['fround', 1],
    ['hypot', null],
    ['imul', 2],
    ['log', 1],
    ['log1p', 1],
    ['log10', 1],
    ['log2', 1],
    ['round', 1],
    ['sign', 1],
    ['sin', 1],
    ['sinh', 1],
    ['sqrt', 1],
    ['tan', 1],
    ['tanh', 1],
    ['trunc', 1]
];

var hypot = function (l) {
    var s = 0;
    for (var i = 0; i < l.length; i++) {
        s += l[i] * l[i];
    }
    return Math.sqrt(s);
}

var fall_backs = {
    'hypot': hypot
};

(function () {
    var i;
    for (i = 0; i < math_consts.length; i++) {
        builtin_math.def(
            new IntString(math_consts[i]),
            new IntNumber(Math[math_consts[i]]));
    }
    var f;
    var var_name;
    for (i = 0; i < math_funcs.length; i++) {
        var_name = math_funcs[i][0];
        f = (function (num_args, builtin_name, builtin_math, fall_back) {
            return function (args) {
                var items = args.list;
                var num_args_given = items.length;
                if (num_args !== null && num_args !== num_args_given) {
                    throw 'Wrong number of arguments for math function ' +
                    builtin_name + ': ' + l + ' instead of ' + num_args +
                    '. They are ' + args.to_s() + '.';
                }
                var inputs = [];
                var input;
                for (var i = 0; i < items.length; i++) {
                    input = items[i];
                    if (!(input instanceof IntNumber)) {
                        throw input.to_s() + '(one of the arguments for math function ' +
                        builtin_name + ') is not a number. The arguments are ' +
                        args.to_s() + '.';
                    }
                    inputs.push(input.n);
                }
                var r;
                if (num_args_given <= max_fn_args) {
                    r = builtin_math.apply(null, inputs);
                } else if (fall_back) {
                    r = fall_back(inputs);
                } else {
                    throw 'Implementation error: no fallback function defined for ' + var_name;
                }
                if (!isFinite(r)) {
                    throw 'Bad arguments ' + args.to_s() + ' for math function ' +
                    builtin_name + ' (perhaps out of its domain).';
                }
                return new IntNumber(r);
            }
        })(math_funcs[i][1], var_name, Math[var_name], fall_backs[var_name]);
        builtin_math.def(
            new IntString(var_name),
            new IntFunction(f)
        );
    }
})();

// math object end

// bitwise object start

var create_bitwise = function (name, f) {
    return new IntFunction(function (args) {
        var l = args.len();
        if (l !== 2) {
            throw 'Bitwise operator ' + name + ' requires exactly 2 arguments, not ' + l +
            '. The arguments are' + args.to_s();
        }
        var x = args.car();
        var y = args.at(1);
        if (!(x instanceof IntNumber)) {
            throw 'The first argument of bitwise operator ' + name +
            ' must be a number, but it is ' + x.to_s() + '.';
        }
        if (!(y instanceof IntNumber)) {
            throw 'The second argument of bitwise operator ' + name +
            ' must be a number, but it is ' + y.to_s() + '.';
        }
        return new IntNumber(f(x.n, y.n));
    });
}

var create_unary_bitwise = function (name, f) {
    return new IntFunction(function (args) {
        var x = check_one_arg(args);
        if (!(x instanceof IntNumber)) {
            throw 'The single argument of bitwise operator ' + name +
            ' must be a number, but it is ' + x.to_s() + '.';
        }
        return new IntNumber(f(x.n));
    });
}

var bitwise = new Hash();

bitwise.def(new IntString('&'), create_bitwise('&', function (x, y) {return x & y}));

bitwise.def(new IntString('|'), create_bitwise('|', function (x, y) {return x | y}));

bitwise.def(new IntString('^'), create_bitwise('^', function (x, y) {return x ^ y}));

bitwise.def(new IntString('<<'), create_bitwise('<<', function (x, y) {return x << y}));

bitwise.def(new IntString('>>'), create_bitwise('>>', function (x, y) {return x >> y}));

bitwise.def(new IntString('>>>'), create_bitwise('>>>', function (x, y) {return x >>> y}));

bitwise.def(new IntString('~'), create_unary_bitwise('~', function (x) {return ~x}));

// bitwise object end

// functional object start

var functional = new Hash();

var compose = new IntFunction(function (args) {
    var l = args.len();
    if (l === 0) {
        return global_id;
    }
    var last = args.last();
    return new IntFunction(function (int_args) {
        var result = last.call(int_args);
        for (var i = l - 2; i > -1; i--) {
            result = args.at(i).call(new List([result]));
        }
        return result;
    });
});

var function_list_initial_check = function (args, name) {
    if (args.len() !== 3) {
        throw name + ' requires exactly three arguments.';
    }
    if (!(args.car() instanceof IntFunction)) {
        throw 'The first argument of ' + name + ' must be a function, but it is ' +
        args.car().to_s();
    }
    if (!(args.at(2) instanceof List)) {
        throw 'The third (last) argument of ' + name + ' must be a list, but it is ' +
        args.at(2).to_s();
    }
}

var foldl = new IntFunction(function (args) {
    function_list_initial_check(args, 'foldl');
    var list = args.at(2);
    var l = list.len();
    var f = args.at(0);
    var result = args.at(1);
    for (var i = 0; i < l; i++) {
        result = f.call(new List([result, list.at(i)]));
    }
    return result;
});

var foldr = new IntFunction(function (args) {
    function_list_initial_check(args, 'foldr');
    var list = args.at(2);
    var l = list.len();
    var f = args.at(0);
    var result = args.at(1);
    for (var i = l - 1; i > -1; i--) {
        result = f.call(new List([list.at(i), result]));
    }
    return result;
});

var scanl = new IntFunction(function (args) {
    function_list_initial_check(args, 'scanl');
    var list = args.at(2);
    var l = list.len();
    var f = args.at(0);
    var result = args.at(1);
    var results = [result];
    for (var i = 0; i < l; i++) {
        result = f.call(new List([result, list.at(i)]));
        results.push(result)
    }
    return new List(results);
});

var scanr = new IntFunction(function (args) {
    function_list_initial_check(args, 'scanr');
    var list = args.at(2);
    var l = list.len();
    var f = args.at(0);
    var result = args.at(1);
    var results = [result];
    for (var i = l - 1; i > -1; i--) {
        result = f.call(new List([list.at(i), result]));
        results.push(result)
    }
    return new List(results.reverse());
});

functional.def(new IntString('compose'), compose);
functional.def(new IntString('foldl'), foldl);
functional.def(new IntString('foldr'), foldr);
functional.def(new IntString('scanl'), scanl);
functional.def(new IntString('scanr'), scanr);

// functional object end

module.exports = {
    'builtin_math': builtin_math,
    'bitwise': bitwise,
    'functional': functional
}
