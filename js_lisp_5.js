'use strict';

// An actual lisp.
// Lexically scoped.

var js_lisp_parse = require('./js_lisp_parse_5');

var parse = js_lisp_parse.parse;
var tokenize = js_lisp_parse.tokenize;

var js_lisp_types = require('./js_lisp_types_5');

var TType = js_lisp_types.TType;
var IntNumber = js_lisp_types.IntNumber;
var IntString = js_lisp_types.IntString;
var IntSymbol = js_lisp_types.IntSymbol;
var IntFunction = js_lisp_types.IntFunction;
var Macro = js_lisp_types.Macro;
var Syntax = js_lisp_types.Syntax;
var List = js_lisp_types.List;
var Hash = js_lisp_types.Hash;
var ParentType = js_lisp_types.ParentType;
var Type = js_lisp_types.Type;

var types = js_lisp_types.types;

var string_in_form = js_lisp_types.string_in_form;

var escapes = js_lisp_types.escapes;

var int_bool_from = js_lisp_types.int_bool_from;
var negate_js = js_lisp_types.negate_js;
var negate = js_lisp_types.negate;
var check_one_arg = js_lisp_types.check_one_arg;
var js_to_bool = js_lisp_types.js_to_bool;

var number_p = function (node, replace) {
    if (replace) {
        node = node.replace('/_/g', '');
    }
    return node.match(/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/);
}

var number_from = function (node) {
    var r_node = node.replace(/_/g, '');
    if (number_p(r_node, false)) {
        return Number(r_node);
    } else {
        return null;
    }
}

var inc = function (x) {
    if (!(x instanceof IntNumber)) {
        throw '1+ only takes numbers!';
    }
    return new IntNumber(x.n + 1);
};

var dec = function (x) {
    if (!(x instanceof IntNumber)) {
        throw '1- only takes numbers!';
    }
    return new IntNumber(x.n - 1);
};

var inc_f = new IntFunction(function (args) {
    var x = check_one_arg(args, '1+');
    return inc(x);
});

var dec_f = new IntFunction(function (args) {
    var x = check_one_arg(args, '1-');
    return dec(x);
});

var inc_set = new Syntax(function (args, scope) {
    var x = check_one_arg(args, '++');
    return scope.set(x, inc(scope.eval(x)));
});

var dec_set = new Syntax(function (args, scope) {
    var x = check_one_arg(args, '--');
    return scope.set(x, dec(scope.eval(x)));
});

var random = new IntFunction(function (args) {
    if (args.len() !== 0) {
        throw 'random takes no arguments!';
    }
    return new IntNumber(Math.random());
});

var randint = new IntFunction(function (args) {
    var x = check_one_arg(args, 'randint');
    if (!(x instanceof IntNumber)) {
        throw 'randint only takes numbers!';
    }
    return new IntNumber(Math.floor(Math.random() * x.n));
});

var plus = new IntFunction(function (args) {
    var sum = 0;
    var l = args.len();
    for (var i = 0; i < l; i++) {
        var item = args.at(i);
        if (!(item instanceof IntNumber)) {
            throw '+ only adds numbers!';
        }
        sum += item.n;
    }
    return new IntNumber(sum);
});

var times = new IntFunction(function (args) {
    var prod = 1;
    var l = args.len();
    for (var i = 0; i < l; i++) {
        var item = args.at(i);
        if (!(item instanceof IntNumber)) {
            throw '* only multiplies numbers!';
        }
        prod *= item.n;
    }
    return new IntNumber(prod);
});

var pow = new IntFunction(function (args) {
    var prod = 1;
    for (var i = args.len() - 1; i > -1; i--) {
        var item = args.at(i);
        if (!(item instanceof IntNumber)) {
            throw '** only takes powers of numbers!';
        }
        prod = Math.pow(item.n, prod);
    }
    return new IntNumber(prod);
});

var sub = new IntFunction(function (args) {
    var l = args.len();
    if (l === 0)  {
        return new IntNumber(0);
    } else if (l == 1) {
        return new IntNumber(-args.at(0).n)
    }
    var dif = args.at(0).n;
    for (var i = 1; i < args.len(); i++) {
        var item = args.at(i);
        if (!(item instanceof IntNumber)) {
            throw '- only subtracts numbers!';
        }
        dif -= item.n;
    }
    return new IntNumber(dif);
});

var check_d = function (item) {
    if (!(item instanceof IntNumber)) {
        throw '/ only divides numbers!';
    }
    if (item.n === 0) {
        throw 'Cannot divide by zero.';
    }
}

var check_int_d = function (item) {
    if (!(item instanceof IntNumber)) {
        throw '// only divides numbers!';
    }
    if (item.n === 0) {
        throw 'Cannot divide by zero.';
    }
}

var div = new IntFunction(function (args) {
    var l = args.len();
    var item;
    if (l === 0)  {
        return new IntNumber(1);
    } else if (l == 1) {
        item = args.car();
        check_d(item);
        return new IntNumber(1 / item.n);
    }
    var quot = args.at(0).n;
    for (var i = 1; i < args.len(); i++) {
        var item = args.at(i);
        check_d(item);
        quot /= item.n;
    }
    return new IntNumber(quot);
});

var int_div = new IntFunction(function (args) {
    var l = args.len();
    var item;
    if (l === 0)  {
        return new IntNumber(1);
    } else if (l == 1) {
        item = args.car();
        check_int_d(item);
        return new IntNumber(Math.floor(1 / item.n));
    }
    var quot = args.at(0).n;
    for (var i = 1; i < args.len(); i++) {
        var item = args.at(i);
        check_int_d(item);
        quot = Math.floor(quot / item.n);
    }
    return new IntNumber(quot);
});

var remainder = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw '% takes two arguments.';
    }
    var x = args.at(0);
    var y = args.at(1);
    var x_n = x.n;
    var y_n = y.n;
    if (!(x instanceof IntNumber && y instanceof IntNumber)) {
        throw '% only does remainder on numbers!';
    }
    if (y_n === 0) {
        throw 'Cannot do remainder by zero.';
    }
    return new IntNumber(x_n % y_n);
});

var mod = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'mod takes two arguments.';
    }
    var x = args.at(0);
    var y = args.at(1);
    var x_n = x.n;
    var y_n = y.n;
    if (!(x instanceof IntNumber && y instanceof IntNumber)) {
        throw 'mod only does modulus on numbers!';
    }
    if (y_n === 0) {
        throw 'Cannot do modulus by zero.';
    }
    return new IntNumber((x_n % y_n + y_n) % y_n);
});

var div = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'div? takes two arguments.';
    }
    var x = args.at(0);
    var y = args.at(1);
    var x_n = x.n;
    var y_n = y.n;
    if (!(x instanceof IntNumber && y instanceof IntNumber)) {
        throw 'div? only does modulus on numbers!';
    }
    if (y_n === 0) {
        throw 'Cannot do divisibility testing by zero.';
    }
    return int_bool_from(x_n % y_n === 0);
});

var floor = new IntFunction(function (args) {
    var x = check_one_arg(args, 'floor');
    if (!(x instanceof IntNumber)) {
        throw 'floor only takes the floor of numbers!';
    }
    return new IntNumber(Math.floor(x.n));
});

var ceil = new IntFunction(function (args) {
    var x = check_one_arg(args, 'ceil');
    if (!(x instanceof IntNumber)) {
        throw 'ceil only takes the ceiling of numbers!';
    }
    return new IntNumber(Math.ceil(x.n));
});

var intp = new IntFunction(function (args) {
    var x = check_one_arg(args, 'int?');
    if (!(x instanceof IntNumber)) {
        throw 'int? only checks whether numbers are integers!';
    }
    var x_n = x.n;
    return int_bool_from(x_n === Math.floor(x_n));
});

var exit = new IntFunction(function (args) {
    if (args.len() !== 0) {
        throw 'exit takes no arguments!';
    }
    process.exit();
})

var quote = new Syntax(function (args) {
    var c = check_one_arg(args, 'quote');
    return c;
});

var make_list = new IntFunction(function (args) {
    return args;
});

var make_hash = new IntFunction(function (args) {
    var my_hash = new Hash();
    var item;
    var len = args.len();
    for (var i = 0; i < len; i++) {
        item = args.at(i);
        if (!(item instanceof List) || item.len() !== 2) {
            throw 'Unlike ' + item.to_s() +
            ', an item used to make a hash must be a list of length 2.';
        }
        my_hash.def(item.at(0), item.at(1));
    }
    return my_hash;
});

var copy_list = function (x) {
    return x.map(function (x) {return x});
}

var copy_js = function (x) {
    if (x instanceof List) {
        return new List(copy_list(x.list));
    } else if (x instanceof Hash) {
        var h = new Hash();
        var l = x.keys().list;
        var item;
        for (var i = 0; i < l.length; i++) {
            item = l[i];
            h.def(item, x.get(item));
        }
        return h;
    } else if (x.basic_type()) {
        return x;
    } else {
        throw 'Cannot copy something of non-basic type that is not a list or hash!';
    }
};

var copy = new IntFunction(function (args) {
    var x = check_one_arg(args, 'copy');
    return copy_js(x);
});

var deepcopy_js = function (x) {
    if (x instanceof List) {
        return new List(x.list.map(function (x) {return deepcopy_js(x)}));
    } else if (x instanceof Hash) {
        var h = new Hash();
        var l = x.keys().list;
        var item;
        for (var i = 0; i < l.length; i++) {
            item = l[i];
            h.def(item, deepcopy(x.get(item)));
        }
        return h;
    } else if (x.basic_type()) {
        return x;
    } else {
        throw 'Cannot deepcopy something of non-basic type that is not a list or hash!';
    }
};

var deepcopy = new IntFunction(function (args) {
    var x = check_one_arg(args, 'deepcopy');
    return deepcopy_js(x);
});

var object_id = (function () {
    var current_id = 0;
    return new IntFunction(function (args) {
        var x = check_one_arg(args, 'object-id');
        if (!('id' in x)) {
            current_id++;
            x.id = current_id;
        }
        return new IntNumber(x.id);
    });
})();

var same = new IntFunction(function (args) {
    var l = args.len();
    if (l === 0) {
        return new TType();
    }
    var a = args.car();
    for (var i = 1; i < l; i++) {
        if (a !== args.at(i)) {
            return new List([]);
        }
    }
    return new TType();
});

var different = new IntFunction(function (args) {
    return negate_js(same.call(args));
});

var global_get_type = new IntFunction(function (args) {
    var x = check_one_arg(args, 'type');
    if (typeof x.get_type !== 'function') {
        throw 'Serious implementation error: cannot get the type of ' + x.to_s() + '!';
    }
    return x.get_type();
});

var global_do = new IntFunction(function (x) {
    return x.last();
});

var global_void = new IntFunction(function () {
    return new List([]);
});

var type_from = new IntFunction(function (x) {
    if (x.len() !== 1) {
        throw 'type-from takes one argument.'
    }
    if (!(x.car() instanceof IntString)) {
        throw 'Types can only be made from strings.'
    }
    return new Type(x.car().s);
});

var is_fn_type = function (x) {
    return x.callable();
}

var defining = function (type_defined, name, created) {
    return new Syntax(function (args, lexical) {
        if (args.len() !== 2) {
            throw 'Wrong number of arguments to the ' + name + ' ' + created +
            '-creator! (not 2) The arguments are: ' + args.to_s();
        }

        var int_arg_names = args.at(0);
        var fn = args.at(1);

        return new type_defined(function (int_args) {
            var internal_scope = new Hash();
            internal_scope.parent = lexical;

            internal_scope['bind-all'](int_arg_names, int_args);

            return internal_scope.eval(fn);
        });
    });
}

var define_construct = function (type_defined, name, created) {
    return new Syntax(function (args, lexical) {
        var l = args.len();

        if (l < 3) {
            throw 'Wrong number of arguments to the ' + name + ' ' + created +
            '-definer! (less than 3) The arguments are: ' + args.to_s();
        }

        var val_name = args.at(0);
        var int_arg_names = args.at(1);
        var fn = args.at(l - 1);

        var lets = args.list.slice(2, -1);

        var lets_l = lets.length;
        for (var i = 0; i < lets_l; i++) {
            if (!(lets[i] instanceof List && lets[i].len() === 2)) {
                throw 'Argument ' + (i + 2) + ' to the ' + name + ' ' + created +
                '-definer, a let, is not a list of length 2: it is ' + lets[i].to_s()
                + '. Note that all the arguments are ' + args.to_s() + '.';
            }
        }

        var f = new type_defined(function (int_args) {
            var internal_scope = new Hash();
            internal_scope.parent = lexical;

            internal_scope['bind-all'](int_arg_names, int_args);

            for (var i = 0; i < lets_l; i++) {
                internal_scope['bind-all'](lets[i].car(), internal_scope.eval(lets[i].at(1)));
            }

            return internal_scope.eval(fn);
        });

        lexical.def(val_name, f);

        return f;
    });
}

var convert_to = function (type_to) {
    return new IntFunction(function (args) {
        var f = check_one_arg(args, 'internal function convert_to'); 

        if (!(is_fn_type(f))) {
            throw f.to_s() + ' is not callable!'
        }
        return new type_to(f.f);
    });
}

var hash_method = function (method_name, num_args) {
    var num_args_plus = num_args + 1;
    return new IntFunction(function (args, scope) {
        var l = args.len();
        if (l === num_args) {
            return scope[method_name].apply(scope, args.list);
        } else if (l === num_args_plus) {
            var s = args.car();
            if (!(s instanceof Hash)) {
                throw 'When calling ' + method_name + ' with ' +
                num_args_plus + ' arguments, the first must be a hash, not ' +
                s.to_s() + '.';
            }
            return s[method_name].apply(s, args.cdr().list);
        } else {
            throw num_args + ' arguments (or ' + num_args_plus + ') expected to ' +
            method_name + ', received ' + l + '.';
        }
    });
}

var in_scope = new Syntax(function (args, scope) {
    if (args.len() !== 2) {
        throw 'in-scope takes two arguments!';
    }
    var new_scope = scope.eval(args.car());
    if (!(new_scope instanceof Hash)) {
        throw new_scope.to_s() + ' cannot be used as a scope!';
    }
    return new_scope.eval(args.at(1));
});

var g_sec = new IntFunction(function (args) {
    var x = check_one_arg(args, 'sec');
    if (!(x instanceof List || x instanceof IntString)) {
        throw 'Only lists and strings have a second item!';
    }
    if (x.len() < 2) {
        throw 'Only lists and strings with at least ' +
        'two items have a second item!';
    }
    return x.at(1);
});

var g_last = new IntFunction(function (args) {
    var x = check_one_arg(args, 'last');
    if (!(x instanceof List || x instanceof IntString)) {
        throw 'Only lists and strings have a last item!';
    }
    return x.last();
});

var butlast = new IntFunction(function (args) {
    var x = check_one_arg(args, 'butlast');
    if (!(x instanceof List || x instanceof IntString)) {
        throw 'Only lists and strings have a removable last item!';
    }
    return x.butlast();
});

var g_let = new Syntax(function (args, scope) {
    if (args.len() === 0) {
        throw 'let needs at least one parameter!';
    }

    var internal_scope = new Hash();
    internal_scope.parent = scope;

    var param = args.last();

    var setting;
    for (var i = 0; i < args.len() - 1; i++) {
        setting = args.at(i);
        if (!(setting instanceof List) || setting.len() !== 2) {
            throw 'The length of non-final parameters of let must be two, ' +
            'which is not true of ' + setting.to_s() + '.';
        }
        internal_scope['bind-all'](setting.car(), internal_scope.eval(setting.at(1)));
    }
    return internal_scope.eval(param);
});

var cond = new Syntax(function (args, scope) {
    var item;
    for (var i = 0; i < args.len(); i++) {
        item = args.at(i);
        if (!(item instanceof List) || item.len() !== 2) {
            throw 'The length of parameters of cond must be two.'
        }
        if (js_to_bool(scope.eval(item.car()))) {
            return scope.eval(item.at(1));
        }
    }

    return new List([]);
});

var g_if = new Syntax(function (args, scope) {
    if (args.len() !== 3 && args.len() !== 2) {
        throw 'if takes three (or two) arguments.';
    }
    if (js_to_bool(scope.eval(args.car()))) {
        return scope.eval(args.at(1));
    } else if (args.len() === 3) {
        return scope.eval(args.at(2));
    } else {
        return new List([]);
    }
});

var g_unless = new Syntax(function (args, scope) {
    if (args.len() !== 3 && args.len() !== 2) {
        throw 'unless takes three (or two) arguments.';
    }
    if (!(js_to_bool(scope.eval(args.car())))) {
        return scope.eval(args.at(1));
    } else if (args.len() === 3) {
        return scope.eval(args.at(2));
    } else {
        return new List([]);
    }
});

var g_while = new Syntax(function (args, scope) {
    if (args.len() !== 2) {
        throw 'while takes two arguments.';
    }
    var x = args.car();
    var y = args.at(1);
    while (js_to_bool(scope.eval(x))) {
        scope.eval(y);
    }
    return new List([]);
});

var g_until = new Syntax(function (args, scope) {
    if (args.len() !== 2) {
        throw 'until takes two arguments.';
    }
    var x = args.car();
    var y = args.at(1);
    while (!(js_to_bool(scope.eval(x)))) {
        scope.eval(y);
    }
    return new List([]);
});

var repeat = new Syntax(function (args, scope) {
    if (args.len() !== 2) {
        throw 'repeat takes two arguments.';
    }
    var x = scope.eval(args.car());
    var y = args.at(1);
    if (!(x instanceof IntNumber)) {
        throw 'repeat\'s first argument must be a number!';
    }
    var l = new List([]);
    for (var i = 0; i < x.n; i++) {
        l.push(scope.eval(y));
    }
    return l;
});

var global_throw = new IntFunction(function (args) {
    var x = check_one_arg(args, 'throw');
    if (!(x instanceof IntString)) {
        throw 'Throwing something other than a string!';
    }
    throw x.s;
});

var pass_scope = new IntFunction(function (args, lexical) {
    var f = check_one_arg(args, 'pass-scope');
    if (!f.callable()) {
        throw 'The parameter to pass-scope should ba callable!';
    }
    var g = f.f;
    var h = function (args, internal_scope) {
        return g(new List([internal_scope].concat(args.list)), internal_scope);
    }
    var l = [IntFunction, Macro, Syntax];
    for (var i = 0 ; i < 3; i++) {
        if (f instanceof l[i]) {
            return new l[i](h);
        }
    }
});

var pass_eval = new IntFunction(function (args, lexical) {
    var f = check_one_arg(args, 'pass-eval');
    if (!f.callable()) {
        throw 'The parameter to pass-eval should ba callable!';
    }
    var g = f.f;
    var n = function (internal_scope) {
        return new IntFunction(function (args) {
            var x = check_one_arg(args, 'an internal function in pass-eval');
            var r = internal_scope.eval(x);
            return r;
        });
    };
    var h = function (args, internal_scope) {
        return g(new List([n(internal_scope)].concat(args.list)), internal_scope);
    }
    var l = [IntFunction, Macro, Syntax];
    for (var i = 0 ; i < 3; i++) {
        if (f instanceof l[i]) {
            return new l[i](h);
        }
    }
});

var is_the_sym = function (a, b) {
    return a instanceof IntSymbol && a.name === b;
}

var quasi_quote = function (list, depth, ev) {
    if (!(list instanceof List) || list.len() === 0) {
        return new List([list]);
    }
    var d;
    var dif = 0;
    if (is_the_sym(list.car(), '`')) {
        if (list.len() !== 2) {
            throw 'Incorrect quasiquotation!'
        }
        dif = 1;
    }
    if (is_the_sym(list.car(), ',')) {
        if (list.len() !== 2) {
            throw 'Incorrect quasiquotation!'
        }
        d = list.at(1);
        if (depth === 1) {
            return new List([ev(d)]);
        }
        dif = -1;
    }
    if (is_the_sym(list.car(), '@,')) {
        if (list.len() !== 2) {
            throw 'Incorrect quasiquotation!'
        }
        d = list.at(1);
        if (depth === 1) {
            return ev(d);
        }
        dif = -1;
    }
    var item;
    var result = [];
    for (var i = 0; i < list.len(); i++) {
        item = list.at(i);
        if (i === 1) {
            result.push(quasi_quote(item, depth + dif, ev));
        } else {
            result.push(quasi_quote(item, depth, ev));
        }
    }
    var all_concated = (new List(result)).concat();
    var final_result = new List([all_concated]);
    return final_result;
}

var g_quasi_quote = new Syntax(function (args, scope) {
    var x = check_one_arg(args, '`');
    var q = quasi_quote(x, 1, function (x) {
        return scope.eval(x);
    });
    if (!(q instanceof List)) {
        throw q.to_s() + ' is not a list! This quasiquote was improper!';
    } else if (q.len() !== 1) {
        throw q.to_s() + ' has a bad number of elements, ' + q.len() +
        ', not 1! This quasiquote was improper!';
    }
    return q.car();
});

var should_be_in_quasiquote = function (name) {
    return new Syntax(function () {
        throw name + ' should only occur in a quasiquote.';
    });
};

var car_cdr = function (s) {
    return new IntFunction(function (args) {
        if (args.len() !== 1) {
            throw 'Only one argument to car/cdr-like functions.'
        }
        var x = args.car();
        for (var i = s.length - 1; i > -1; i--) {
            if (!(x instanceof List || x instanceof IntString)) {
                throw 'Only lists and strings have a car or cdr.'
            }
            if (s[i] === 'a') {
                x = x.car();
            } else {
                x = x.cdr();
            }
        }
        return x;
    }, 'c' + s + 'r');
}

var macro_expand = new Syntax(function (args, scope) {
    var x = scope.eval(args.car());
    if (!(x instanceof Macro)) {
        throw 'You can only expand a macro!';
    }
    return x.macro_call(args.cdr(), scope);
});

var global_splat = new IntFunction(function (f_args) {
    var f = check_one_arg(f_args, 'splat');
    var l = [IntFunction, Macro, Syntax];
    var method;
    var type;
    if (f instanceof IntFunction) {
        type = IntFunction;
        method = 'call';
    } else if (f instanceof Macro) {
        type = Macro;
        method = 'macro_call';
    } else if (f instanceof Syntax) {
        type = Syntax;
        method = 'syntax_call';
    } else {
        throw 'A parameter to splat must be callable!';
    }
    return new type(function (args, scope) {
        return f[method](new List([args]), scope);
    });
});

var global_apply = new IntFunction(function (f_args) {
    var f = check_one_arg(f_args, 'apply');
    var method;
    var type;
    if (f instanceof IntFunction) {
        type = IntFunction;
        method = 'call';
    } else if (f instanceof Macro) {
        type = Macro;
        method = 'macro_call';
    } else if (f instanceof Syntax) {
        type = Syntax;
        method = 'syntax_call';
    } else {
        throw 'A parameter to apply must be callable!';
    }
    return new type(function (args, scope) {
        var x = check_one_arg(args, 'a result of apply');
        if (!(x instanceof List)) {
            throw 'Only a list can be passed to a result of apply!';
        }
        return f[method](x, scope);
    });
});

var global_push = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'push should have two arguments!';
    }

    var x = args.car();
    var y = args.at(1);

    if (!(x instanceof List)) {
        throw 'Only a list can be pushed to!'
    }

    return x.push(y);
});

var global_pop = new IntFunction(function (args) {
    var x = check_one_arg(args, 'pop');

    if (!(x instanceof List)) {
        throw 'Only a list can be popped from!'
    }

    return x.pop();
});

var global_at = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'at should have two arguments!';
    }

    var x = args.car();
    var y = args.at(1);

    if (!(x instanceof List)) {
        throw 'Only a list can be indexed into!'
    }

    if (!(n instanceof IntNumber)) {
        throw 'Only a number is a valid index!'
    }

    return x.at(y.n);
});


var global_nil = new List([]);

var global_t = new TType();

var global_parent = new ParentType();

var global_scope = {'hash': {}};

global_scope.hash['1+'] = inc_f;
global_scope.hash['1-'] = dec_f;
global_scope.hash['inc'] = inc_f;
global_scope.hash['dec'] = dec_f;
global_scope.hash['++'] = inc_set;
global_scope.hash['--'] = dec_set;
global_scope.hash.random = random;
global_scope.hash.randint = randint;
global_scope.hash['+'] = plus;
global_scope.hash['*'] = times;
global_scope.hash['**'] = pow;
global_scope.hash['-'] = sub;
global_scope.hash['/'] = div;
global_scope.hash['//'] = int_div;
global_scope.hash['%'] = remainder;
global_scope.hash.mod = mod;
global_scope.hash['div?'] = div;
global_scope.hash.floor = floor;
global_scope.hash.ceil = ceil;
global_scope.hash['int?'] = intp;
global_scope.hash.quote = quote;
global_scope.hash.list = make_list;
global_scope.hash.exit = exit;
global_scope.hash.t = global_t;
global_scope.hash['parent'] = global_parent;
global_scope.hash.nil = global_nil;
global_scope.hash.hash = make_hash;
global_scope.hash.type = global_get_type;
global_scope.hash['type-from'] = type_from;
global_scope.hash['pass-eval'] = pass_eval;
global_scope.hash['pass-scope'] = pass_scope;
global_scope.hash['throw'] = global_throw;
global_scope.hash['do'] = global_do;
global_scope.hash['void'] = global_void;
global_scope.hash['id'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'id');
    return x;
});
global_scope.hash['in-scope'] = in_scope;

global_scope.hash.copy = copy;
global_scope.hash.deepcopy = deepcopy;

global_scope.hash['object-id'] = object_id;

global_scope.hash['same?'] = same;
global_scope.hash['different?'] = different;

global_scope.hash['number'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'number');
    if (x instanceof IntNumber) {
        return x;
    }
    if (!(x.basic_type())) {
        throw 'Only basic types can be converted to numbers!';
    }
    var n = number_from(x.to_s_text());
    if (n === null) {
        throw 'Conversion of ' + x.to_s() + ' to a number failed!';
    }
    return new IntNumber(n);
});

global_scope.hash.zip = new IntFunction(function (args) {
    var l = args.len();
    if (l === 0) {
        throw 'Cannot zip no items.';
    }
    for (var i = 0; i < l; i++) {
        if (!(args.at(i) instanceof List)) {
            throw 'Cannot zip ' + args.at(i).to_s() + ' since it is not a list.';
        }
    }
    var m = args.car().len();
    for (var i = 1; i < l; i++) {
        if (args.at(i).len() !== m) {
            throw 'Cannot zip items of different lengths.';
        }
    }
    var r = [];
    for (var i = 0; i < m; i++) {
        var s = [];
        for (var j = 0; j < l; j++) {
            s.push(args.at(j).at(i));
        }
        r.push(new List(s));
    }
    return new List(r);
});

global_scope.hash['car-cdr?'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'car-cdr?');
    if (x instanceof IntFunction) {
        return int_bool_from(x.basic_type());
    }
    if (!(x.basic_type())) {
        return new List([]);
    }
    return int_bool_from(x.to_s_text().match(/^c[ad]*r$/));
});

global_scope.hash['car-cdr'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'car-cdr?');
    if (x instanceof IntFunction) {
        if (!x.basic_type()) {
            throw 'Functions that are not already like car and cdr ' +
            'cannot be converted.';
        }
        return x;
    }
    if (!(x.basic_type())) {
        throw 'Non-basic values cannot be converted to values like car and cdr.';
    }
    var s = x.to_s_text();
    if (!s.match(/^c[ad]*r$/)) {
        throw 'Even basic values that do not look like car and cdr cannot be converted.';
    }
    return car_cdr(s.slice(1, -1));
});

global_scope.hash['number?'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'number?');
    if (x instanceof IntNumber) {
        return new TType();
    }
    if (!(x.basic_type())) {
        return new List([]);
    }
    return int_bool_from(number_p(x.to_s_text(), true));
});

global_scope.hash.symbol = new IntFunction(function (args) {
    var x = check_one_arg(args, 'symbol');
    if (x instanceof IntSymbol) {
        return x;
    }
    if (!(x.basic_type())) {
        throw 'Only basic types can be converted to symbols!';
    }
    return new IntSymbol(x.to_s_text());
});

global_scope.hash.choice = new IntFunction(function (args) {
    var x = check_one_arg(args, 'choice');
    if (!(x instanceof List || x instanceof IntString)) {
        throw 'Only lists and strings can be chosen from.';
    }
    var l = x.len();
    if (l === 0) {
        throw 'An empty list or string cannot be chosen from.';
    }
    return x.at(Math.floor(Math.random() * l));
});

var concat_lists = new IntFunction(function (args, scope) {
    return new List([].concat.apply([], args.list.map(function (x) {
        if (x instanceof List) {
            return x.list;
        } else {
            return [x];
        }
    })))
});

var elem = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'elem? takes two arguments!'
    }
    var item = args.car();
    var my_list = args.at(1);
    if (!(my_list instanceof List)) {
        throw 'The second argument to elem? must be a list!';
    }
    var l = my_list.len();
    for (var i = 0; i < l; i++) {
        if (item.eq(my_list.at(i))) {
            return new TType();
        }
    }
    return new List([]);
});

var substring = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'substring? takes two arguments!'
    }
    var sub = args.car();
    var whole = args.at(1);
    if (!(sub instanceof IntString)) {
        throw 'The first argument to substring? must be a string!';
    }
    if (!(whole instanceof IntString)) {
        throw 'The second argument to substring? must be a string!';
    }
    return int_bool_from(whole.s.indexOf(sub.s) !== -1);
});

var nth = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'nth takes two arguments!'
    }
    var my_list = args.car();
    var pos = args.at(1);
    if (!(my_list instanceof List || my_list instanceof IntString)) {
        throw 'The first argument to nth must be a list or string!';
    }
    if (!(pos instanceof IntNumber)) {
        throw 'The second argument to nth must be a number!';
    }
    return my_list.at(pos.n)
});

var set_nth = new IntFunction(function (args, scope) {
    if (args.len() !== 3) {
        throw 'set-nth takes three arguments!'
    }
    var my_list = args.car();
    var pos = args.at(1);
    var value = args.at(2);
    if (!(my_list instanceof List)) {
        throw 'The first argument to set-nth must be a list!';
    }
    if (!(pos instanceof IntNumber)) {
        throw 'The second argument to set-nth must be a number!';
    }
    var pos_n = pos.n;
    if (pos_n < 0 || pos_n > my_list.len() - 1 ||
        Math.floor(pos_n) !== pos_n) {
        throw 'The index in set-nth must be in range and an integer!';
    }
    my_list.list[pos_n] = value;
    return value;
});

var take = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'take takes two arguments!'
    }
    var my_list = args.car();
    var pos = args.at(1);
    if (!(my_list instanceof List || my_list instanceof IntString)) {
        throw 'The first argument to take must be a list or string!';
    }
    if (!(pos instanceof IntNumber)) {
        throw 'The second argument to take must be a number!';
    }
    var pos_n = pos.n;
    if (pos_n < 0 || pos_n > my_list.len() ||
        Math.floor(pos_n) !== pos_n) {
        throw 'The index in take must be in range and an integer!';
    }
    return my_list.slice(0, pos_n);
});

var drop = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'drop takes two arguments!'
    }
    var my_list = args.car();
    var pos = args.at(1);
    if (!(my_list instanceof List || my_list instanceof IntString)) {
        throw 'The first argument to drop must be a list or string!';
    }
    if (!(pos instanceof IntNumber)) {
        throw 'The second argument to drop must be a number!';
    }
    var pos_n = pos.n;
    if (pos_n < 0 || pos_n > my_list.len() ||
        Math.floor(pos_n) !== pos_n) {
        throw 'The index in drop must be in range and an integer!';
    }
    return my_list.slice(pos_n);
});

var slice = new IntFunction(function (args, scope) {
    if (args.len() !== 3) {
        throw 'slice takes three arguments!'
    }
    var my_list = args.car();
    var start_pos = args.at(1);
    var end_pos = args.at(2);
    if (!(my_list instanceof List || my_list instanceof IntString)) {
        throw 'The first argument to slice must be a list or string!';
    }
    if (!(start_pos instanceof IntNumber)) {
        throw 'The second argument to slice must be a number!';
    }
    if (!(end_pos instanceof IntNumber)) {
        throw 'The third argument to slice must be a number!';
    }
    var start_pos_n = start_pos.n;
    var end_pos_n = end_pos.n;
    if (start_pos_n < 0 || start_pos_n > my_list.len() ||
        Math.floor(start_pos_n) !== start_pos_n) {
        throw 'The first (starting) index in slice must be ' +
        'in range and an integer!';
    }
    if (end_pos_n < 0 || end_pos_n > my_list.len() ||
        Math.floor(end_pos_n) !== end_pos_n) {
        throw 'The second (ending) index in slice must be ' +
        'in range and an integer!';
    }
    if (start_pos_n > end_pos_n) {
        throw 'The starting index in slice must be ' + 
        'no greater than the ending index!';
    }
    return my_list.slice(start_pos_n, end_pos_n);
});

var g_len = new IntFunction(function (args) {
    var x = check_one_arg(args, 'len');
    if (!(x instanceof List || x instanceof IntString
        || x instanceof Hash)) {
        throw 'Only strings, lists, and hashes have a length!';
    }
    return new IntNumber(x.len());
});

var cons = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'cons takes two arguments!';
    }
    var x = args.car();
    var y = args.at(1);
    if (!(y instanceof List)) {
        throw 'You can only cons onto a list!';
    }
    return y.cons(x);
});

global_scope.hash.cons = cons;
global_scope.hash['elem?'] = elem;
global_scope.hash['substring?'] = substring;
global_scope.hash.nth = nth;
global_scope.hash['set-nth'] = set_nth;
global_scope.hash.take = take;
global_scope.hash.drop = drop;
global_scope.hash.slice = slice;
global_scope.hash.last = g_last;
global_scope.hash.butlast = butlast;
global_scope.hash.sec = g_sec;
global_scope.hash['let'] = g_let;
global_scope.hash['len'] = g_len;

global_scope.hash['atom?'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'atom?');
    return int_bool_from(!(x instanceof List));
});

global_scope.hash['list?'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'list?');
    return int_bool_from(x instanceof List);
});

global_scope.hash.cond = cond;
global_scope.hash['if'] = g_if;
global_scope.hash['unless'] = g_unless;
global_scope.hash['while'] = g_while;
global_scope.hash['until'] = g_until;
global_scope.hash['repeat'] = repeat;

global_scope.hash['callable?'] = new IntFunction (function (args) {
    var x = check_one_arg(args, 'callable?');
    return int_bool_from(x.callable());
});

global_scope.hash['basic-type?'] = new IntFunction (function (args) {
    var x = check_one_arg(args, 'basic-type?');
    return int_bool_from(x.basic_type());
});

var q_func = function (name, method) {
    return new Syntax(function (args, scope) {
        var l = args.len();
        if (l !== 2 && l !== 3) {
            throw name + ' takes two or three arguments! The arguments given were ' + args.to_s();
        }
        var x;
        var y;
        var s;
        if (l === 2) {
            s = scope;
            x = args.car();
            y = args.at(1);
        } else {
            s = scope.eval(args.car());
            if (!(s instanceof Hash)) {
                throw 'The first argument of ' + name + ', ' + s.to_s() + ', is not a hash! ' +
                'The arguments given were ' + args.to_s();
            }
            x = args.at(1);
            y = args.at(2);
        }
        var z = s.eval(y);
        s[method](x, z);
        return z;
    });
}

global_scope.hash['defq'] = q_func('defq', 'def');

global_scope.hash['setq'] = q_func('setq', 'set');

global_scope.hash['lambda'] = defining(IntFunction, 'lambda', 'function');
global_scope.hash['func'] = defining(IntFunction, 'func', 'function');
global_scope.hash['fun'] = defining(IntFunction, 'fun', 'function');
global_scope.hash['fn'] = defining(IntFunction, 'fn', 'function');
global_scope.hash['function'] = defining(IntFunction, 'function', 'function');
global_scope.hash['macro'] = defining(Macro, 'macro', 'macro');
global_scope.hash['mac'] = defining(Macro, 'mac', 'syntax');
global_scope.hash['syntax'] = defining(Syntax, 'syntax', 'syntax');
global_scope.hash['syn'] = defining(Syntax, 'syn', 'syntax');

global_scope.hash['defn'] = define_construct(IntFunction, 'defn', 'function');
global_scope.hash['defm'] = define_construct(Macro, 'defm', 'macro');
global_scope.hash['defs'] = define_construct(Syntax, 'defs', 'syntax');

global_scope.hash['fn-from'] = convert_to(IntFunction);
global_scope.hash['mac-from'] = convert_to(Macro);
global_scope.hash['syn-from'] = convert_to(Syntax);

global_scope.hash['macro-expand'] = macro_expand;

global_scope.hash.apply = global_apply;
global_scope.hash.splat = global_splat;

global_scope.hash.push = global_push;

global_scope.hash.concat = concat_lists;

global_scope.hash.pop = global_pop;

global_scope.hash.bool = new IntFunction(function (args) {
    var x = check_one_arg(args, 'bool');
    return int_bool_from(!(x instanceof List) || x.len() !== 0);
});

global_scope.hash.str = new IntFunction(function (args) {
    var x = check_one_arg(args, 'str');
    return new IntString(x.to_s());
});

var string_concat_join = function (values, s, f_name) {
    return new IntString(values.list.map(function (x) {
        if (!(x.basic_type())) {
            throw 'Only basic types can be concatenated as strings. (Found in '
                + f_name + '.)';
        }
        return x.to_s_text();
    }).join(s.s));
}

global_scope.hash['~'] = new IntFunction(function (args) {
    return string_concat_join(args, new IntString(''), '~');
});

var eq = new IntFunction(function (args) {
    var l = args.len();
    if (l === 0) {
        return new TType();
    }
    var a = args.car();
    for (var i = 1; i < l; i++) {
        if (!(a.eq(args.at(i)))) {
            return new List([]);
        }
    }
    return new TType();
});

global_scope.hash['char-from'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'char-from');
    if (!(x instanceof IntNumber)) {
        throw 'char-from is only defined on numbers.';
    }
    var n = x.n;
    if (n < 0 || n > 65535 || Math.floor(n) !== n) {
        throw 'char-from is only defined on integers between 0 and 65535, not on ' +
        n + '.';
    }
    return new IntString(String.fromCharCode(n));
});

global_scope.hash['char-code'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'char-code');
    if (!(x instanceof IntString)) {
        throw 'char-code is only defined on strings.';
    }
    var s = x.s;
    if (s.length !== 1) {
        throw 'char-code is only defined on single characters, not on ' +
        x.to_s() + '.';
    }
    return new IntNumber(s.charCodeAt(0));
});

global_scope.hash['chars'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'chars');
    if (!(x instanceof IntString)) {
        throw 'chars is only defined on strings.';
    }
    return new List(x.s.split('').map(function (x) {return new IntString(x)}));
});

global_scope.hash['='] = eq;

global_scope.hash['!='] = new IntFunction(function (args) {
    return negate_js(eq.call(args));
});

var js_compare_values = function (a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else if (a === b) {
        return 0;
    } else {
        throw 'Implementation error: failed to compare ' + a + ' and ' + b;
    }
}

var prim_compare_values = function (a, b, s) {
    var x;
    var y;
    if (a instanceof IntNumber) {
        if (!(b instanceof IntNumber)) {
            throw 'Failed comparison of ' + a.to_s() + ' and ' + b.to_s() +
            ', while calulating ' + s;
        }
        x = a.n;
        y = b.n;
    } else if (a instanceof IntString) {
        if (!(b instanceof IntString)) {
            throw 'Failed comparison of ' + a.to_s() + ' and ' + b.to_s() +
            ', while calulating ' + s;
        }
        x = a.s;
        y = b.s;
    } else {
        throw 'Failed comparison of ' + a.to_s() + ' and ' + b.to_s() +
            ', while calulating ' + s;
    }
    return js_compare_values(x, y);
}

var compare_values = function (a, b, s) {
    if (a instanceof List) {
        if (!(b instanceof List)) {
            throw 'Failed comparison of ' + a.to_s() + ' and ' + b.to_s() +
            ', while calulating ' + s;
        }
        var l1 = a.len();
        var l2 = b.len();
        var l = Math.min(l1, l2);
        var c;
        for (var i = 0; i < l; i++) {
            c = compare_values(a.at(i), b.at(i), s);
            if (c !== 0) {
                return c;
            }
        }
        return js_compare_values(l1, l2);
    } else {
        return prim_compare_values(a, b, s);
    }
}

var comp = function (c, s) {
    return new IntFunction(function (args) {
        if (args.len() === 0) {
            return new TType();
        }

        var a = args.car();

        var v_a;
        var v_b;

        for (var i = 1; i < args.len(); i++) {
            v_a = args.at(i - 1);
            v_b = args.at(i);
            if (!(c(compare_values(v_a, v_b, s)))) {
                return new List([]);
            }
        }
        return new TType();
    });
}

global_scope.hash['<'] = comp(function (a) {
    return a === -1;
}, '<');

global_scope.hash['<='] = comp(function (a, b) {
    return a !== 1;
}, '<=');

global_scope.hash['=<'] = comp(function (a, b) {
    return a !== 1;
}, '=<');

global_scope.hash['>'] = comp(function (a, b) {
    return a === 1;
}, '>');

global_scope.hash['>='] = comp(function (a, b) {
    return a !== -1;
}, '>=');

global_scope.hash['=>'] = comp(function (a, b) {
    return a !== -1;
}, '=>');

var int_cmp = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw '<=> takes two arguments!';
    }
    var a = args.car();
    var b = args.at(1);
    return new IntNumber(compare_values(a, b, '<=>'));
});

global_scope.hash['<=>'] = int_cmp;

global_scope.hash.sort = new IntFunction(function (args) {
    var len = args.len();
    if (len !== 1 && len !== 2) {
        throw 'sort takes one or two arguments!';
    }
    var x = args.car();
    if (!(x instanceof List)) {
        throw 'The first argument of sort muct be a list, not ' + x.to_s() + '!';
    }
    var f;
    if (len === 2) {
        f = args.at(1);
    } else {
        f = int_cmp;
    }
    if (!(f instanceof IntFunction)) {
        throw 'The second argument of sort muct be a function, not ' + x.to_s() + '!';
    }
    return new List(copy_list(x.list).sort(function (a, b) {
        var r = f.call(new List([a, b]));
        if (!(r instanceof IntNumber)) {
            throw 'A sorting function produced a non-number, ' + r.to_s() + '!';
        }
        return r.n;
    }));
});

global_scope.hash.min = new IntFunction(function (args) {
    var len = args.len();
    if (len === 0) {
        throw 'min needs an argument!';
    }
    var x = args.car();
    for (var i = 1; i < len; i++) {
        if (compare_values(args.at(i), x, 'min') === -1) {
            x = args.at(i);
        }
    }
    return x;
});

global_scope.hash.max = new IntFunction(function (args) {
    var len = args.len();
    if (len === 0) {
        throw 'max needs an argument!';
    }
    var x = args.car();
    for (var i = 1; i < len; i++) {
        if (compare_values(args.at(i), x, 'max') === 1) {
            x = args.at(i);
        }
    }
    return x;
});

global_scope.hash['catch'] = new Syntax(function (args, scope) {
    var x = check_one_arg(args, 'catch');
    try {
        return new List([new TType(), scope.eval(x)]);
    } catch (e) {
        if (typeof e !== 'string') {
            throw e;
        }
        return new List([new List([]), new IntString(e)]);
    }
});

global_scope.hash.and = new Syntax(function (args, scope) {
    var v;
    if (args.len() === 0) {
        return new TType();
    }
    for (var i = 0; i < args.len() - 1; i++) {
        v = scope.eval(args.at(i));
        if (!(js_to_bool(v))) {
            return v;
        }
    }
    return scope.eval(args.at(args.len() - 1));
});

global_scope.hash['current-scope'] = new IntFunction(function (args, scope) {
    if (args.len() !== 0) {
        throw 'current-scope takes no arguments.';
    }
    return scope;
});

global_scope.hash.or = new Syntax(function (args, scope) {
    var v;
    if (args.len() === 0) {
        return new List([]);
    }
    for (var i = 0; i < args.len() - 1; i++) {
        v = scope.eval(args.at(i));
        if (js_to_bool(v)) {
            return v;
        }
    }
    return scope.eval(args.at(args.len() - 1));
});

global_scope.hash.not = negate;

global_scope.hash.each = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'each takes two arguments!';
    }
    if (!(args.at(1) instanceof List)) {
        throw 'each\'s second argument must be a list.';
    }
    return args.at(1).each(args.car(), scope);
});

global_scope.hash.map = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'map takes two arguments!';
    }
    var y = args.at(1);
    if (!(y instanceof List)) {
        throw 'map\'s second argument must be a list.';
    }
    return y.map(args.car(), scope);
});

global_scope.hash.filter = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'filter takes two arguments!';
    }
    var y = args.at(1);
    if (!(y instanceof List)) {
        throw 'filter\'s second argument must be a list.';
    }
    return y.filter(args.car(), scope);
});

global_scope.hash['any?'] = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'any? takes two arguments!';
    }
    var y = args.at(1);
    if (!(y instanceof List)) {
        throw 'any?\'s second argument must be a list.';
    }
    return y.any(args.car(), scope);
});

global_scope.hash['all?'] = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'all? takes two arguments!';
    }
    var y = args.at(1);
    if (!(y instanceof List)) {
        throw 'all?\'s second argument must be a list.';
    }
    return y.all(args.car(), scope);
});

global_scope.hash.split = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'split takes exactly two arguments!';
    }
    var x = args.car();
    var y = args.at(1);
    if (!x.basic_type()) {
        throw 'The first argument of split must be a basic type.';
    }
    if (!y.basic_type()) {
        throw 'The second argument of split must be a basic type.';
    }
    var parts = x.to_s_text().split(y.to_s_text());
    return new List(parts.map(function (x) {
        return new IntString(x);
    }));
});

global_scope.hash.join = new IntFunction(function (args) {
    if (args.len() !== 2) {
        throw 'join takes exactly two arguments!';
    }
    var x = args.car();
    var y = args.at(1);
    if (!(x instanceof List)) {
        throw 'The first argument of join must be a list.';
    }
    if (!y.basic_type()) {
        throw 'The second argument of join must be a basic type.';
    }
    return string_concat_join(x, new IntString(y.to_s_text()), 'join');
});

global_scope.hash.range = new IntFunction(function (args, scope) {
    if (args.len() !== 2) {
        throw 'range takes two arguments!';
    }
    var x = args.car();
    var y = args.at(1);
    if (!(x instanceof IntNumber)) {
        throw 'The first argument of range must be a number.';
    }
    if (!(y instanceof IntNumber)) {
        throw 'The second argument of range must be a number.';
    }
    var x_n = x.n;
    var y_n = y.n;
    var l = [];
    while (x_n < y_n) {
        l.push(new IntNumber(x_n));
        x_n++;
    }
    return new List(l);
});

global_scope.hash.reverse = new IntFunction(function (args, scope) {
    var x = check_one_arg(args, 'reverse');
    if (!(x instanceof List || x instanceof IntString)) {
        throw 'reverse\'s argument must be a list or string.';
    }
    if (x instanceof List) {
        return new List(copy_list(x.list).reverse());
    } else {
        return new IntString(x.s.split('').reverse().join(''));
    }
});

global_scope.hash.print = new IntFunction(function (args) {
    for (var i = 0; i < args.len(); i++) {
        console.log(args.at(i).to_s());
    }
    return new List([]);
});

var code_to_s = function (x) {
    if (x instanceof IntString || x instanceof IntNumber) {
        return x.to_s();
    } else if (x instanceof IntSymbol) {
        return x.name;
    } else if (x instanceof List) {
        return '(' + x.list.map(code_to_s).join(' ') + ')';
    } else if (x instanceof IntFunction && x.s !== undefined) {
        return x.s;
    } else {
        throw 'Cannot convert given type of ' + x.to_s() +
        ' (' + x.get_type().type + ') to string as code!';
    }
}

global_scope.hash['upper'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'upper');
    if (!(x instanceof IntString)) {
        throw 'upper only takes strings, not ' + code_to_s(x) + '!';
    }
    return new IntString(x.s.toUpperCase());
});

global_scope.hash['lower'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'lower');
    if (!(x instanceof IntString)) {
        throw 'lower only takes strings, not ' + code_to_s(x) + '!';
    }
    return new IntString(x.s.toLowerCase());
});

global_scope.hash['str-code'] = new IntFunction(function (args) {
    var x = check_one_arg(args, 'str-code');
    return new IntString(code_to_s(x));
});

global_scope.hash.puts = new IntFunction(function (args) {
    var s = string_concat_join(args, new IntString(''), 'puts').s;
    console.log(s);
    return new List([]);
});

global_scope.hash['get'] = hash_method('get', 1);
global_scope.hash['safe-get'] = hash_method('safe-get', 1);
global_scope.hash['def'] = hash_method('def', 2);
global_scope.hash['set'] = hash_method('set', 2);
global_scope.hash['del'] = hash_method('del', 1);
global_scope.hash['has?'] = hash_method('has?', 1);
global_scope.hash['has-own?'] = hash_method('has-own?', 1);
global_scope.hash['keys'] = hash_method('keys', 0);
global_scope.hash['pairs'] = hash_method('pairs', 0);
global_scope.hash['values'] = hash_method('values', 0);

global_scope.hash['extend'] = hash_method('extend', 1);
global_scope.hash['eval'] = hash_method('eval', 1);
global_scope.hash['bind-all'] = hash_method('bind-all', 2);

global_scope.hash['`'] = g_quasi_quote;

global_scope.hash[','] = should_be_in_quasiquote(',');

global_scope.hash['@,'] = should_be_in_quasiquote('@,');

var get_t_scope = function () {
    var t_scope = new Hash();
    for (var i in global_scope.hash) {
        t_scope.def(new IntString(i), global_scope.hash[i]);
    }
    return t_scope;
}

var t_scope = get_t_scope();

var read_node = function (node) {
    if (node === null) {
        return new List([quote, new List([])]);
    } else if (node[0] === '"') {
        return new IntString(node.slice(1));
    } else if (number_from(node) !== null) {
        var n = number_from(node);
        return new IntNumber(n);
    } else if (node[0] === ':') {
        if (node.length === 1) {
            throw 'Symbols should not be empty, for it creates confusion.';
        }
        return new List([quote, new IntSymbol(node.slice(1))]);
    } else if (node[0] === '\\') {
        if (node.length === 1) {
            throw 'Word-strings should not be empty, for it creates confusion.';
        }
        return new IntString(node.slice(1));
    } else if (node.match(/^c[ad]*r$/)) {
        return car_cdr(node.slice(1, -1));
    } else {
        return new IntSymbol(node);
    }
}

var transform_list = function (x) {
    if (Array.isArray(x)) {
        return new List(x.map(transform_list));
    }
    return read_node(x);
}

var show_prompt = function () {
    process.stdin.write('>>> '); 
}

var main = function () {
    var special_line_break_value = 0;

    var line_breaks = 0;

    var t = '';

    var stdin = process.openStdin();

    show_prompt();

    var ast;
    var pre_ast;
    var final_result;

    stdin.addListener('data', function (d) {
        d = d.toString().slice(0, -1);
        if (d.slice(0, 4) === '*** ' && !(isNaN(d.slice(4)))) {
            special_line_break_value = Number(d.slice(4));
            show_prompt();
            return;
        }

        t += d + '\n';
        if (d === '') {
            line_breaks++;
        }
        if (line_breaks < special_line_break_value) {
            show_prompt();
            return;
        }
        line_breaks = 0;

        try {
            pre_ast = parse(tokenize(t.slice(0, -1)));
            ast = transform_list(pre_ast);
            final_result = t_scope.eval(ast);
            console.log(final_result.to_s());
        } catch (e) {
            console.log('There was an exception:');
            console.log(e);
        }
        t = '';
        show_prompt();
    });
}

module.exports = {
    'global_scope': t_scope,
    'transform_list': transform_list,
    'parse': parse,
    'tokenize': tokenize,
    'show_prompt': show_prompt,
    'IntString': IntString,
    'List': List
}

if (require.main === module) {
    main();
}