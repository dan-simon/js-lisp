'use strict';

var check_one_arg = function (args, name) {
    if (args.len() !== 1) {
        throw 'There should be only one argument to ' + name + '. ('
            + args.len() + ' found; they are ' + args.to_s() + ')';
    }
    return args.car();
}

var regexify = function (x) {
    return x.replace(/[^a-z]/g, function (x) {return '\\' + x});
}

var string_in_form = function (string) {
    string = string.replace(/\\/g, '\\\\');
    for (var i in escapes) {
        if (i !== '\\' && i !== '"') {
            string = string.replace(
                new RegExp(regexify(escapes[i]), 'g'), '\\' + i);
        }
    }
    return '\'' + string + '\'';
}

var escapes = {'n': '\n', '\\': '\\', '\'': '\'', '"': '"', 't': '\t'};

var TType = function () {}

TType.prototype.eq = function (y) {
    return y instanceof TType;
}

TType.prototype.to_s = function () {
    return 't';
}

TType.prototype.to_s_text = function () {
    return 't';
}

TType.prototype.basic_type = function () {
    return true;
}

TType.prototype.callable = function () {
    return false;
}

TType.prototype.get_type = function () {
    return new Type('t');
}

var ParentType = function () {}

ParentType.prototype.eq = function (y) {
    return y instanceof ParentType;
}

ParentType.prototype.to_s = function () {
    return 'parent';
}

ParentType.prototype.to_s_text = function () {
    return 'parent';
}

ParentType.prototype.basic_type = function () {
    return true;
}

ParentType.prototype.callable = function () {
    return false;
}

ParentType.prototype.get_type = function () {
    return new Type('parent');
}

var int_bool_from = function (b) {
    if (b) {
        return new TType();
    } else {
        return new List([]);
    }
}

var js_to_bool = function (b) {
    return !(b instanceof List && b.len() === 0);
}

var IntNumber = function (n) {
    this.n = n;
}

IntNumber.prototype.eq = function (y) {
    if (!(y instanceof IntNumber)) {
        return false;
    }
    return this.n === y.n;
}

IntNumber.prototype.to_s = function () {
    return this.n.toString();
}

IntNumber.prototype.to_s_text = function () {
    return this.n.toString();
}

IntNumber.prototype.get_type = function () {
    return new Type('number');
}

IntNumber.prototype.basic_type = function () {
    return true;
}

IntNumber.prototype.callable = function () {
    return false;
}

var IntString = function (s) {
    this.s = s;
}

IntString.prototype.car = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty string has no car.'
    }
    return new IntString(this.s[0]);
}

IntString.prototype.cdr = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty string has no cdr.'
    }
    return new IntString(this.s.slice(1));
}

IntString.prototype.eq = function (y) {
    if (!(y instanceof IntString)) {
        return false;
    }
    return this.s === y.s;
}

IntString.prototype.len = function () {
    return this.s.length;
}

IntString.prototype.at = function (index) {
    if (index < 0 || index > this.s.length - 1 ||
        Math.floor(index) !== index) {
        throw 'Issue: impossible array access.'
    }
    return new IntString(this.s[index]);
}

IntString.prototype.last = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty string has no last character.'
    }
    return new IntString(this.s[this.s.length - 1]);
}

IntString.prototype.butlast = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty string has no last character to remove.'
    }
    return new IntString(this.s.slice(0, -1));
}

IntString.prototype.to_s = function () {
    return string_in_form(this.s);
}

IntString.prototype.to_s_text = function () {
    return this.s;
}

IntString.prototype.get_type = function () {
    return new Type('string');
}

IntString.prototype.basic_type = function () {
    return true;
}

IntString.prototype.callable = function () {
    return false;
}

var IntSymbol = function (x) {
    this.name = x;
}

IntSymbol.prototype.eq = function (y) {
    if (!(y instanceof IntSymbol)) {
        return false;
    }
    return this.name === y.name;
}

IntSymbol.prototype.to_s = function () {
    var n = this.name;
    if (n === '') {
        return '(symbol \'\')'
    }
    var d = {
        '(': true,
        ')': true,
        ' ': true,
        '\t': true,
        '\n': true,
        '"': true,
        '\'': true,
    }
    for (var c = 0; c < n.length; c++) {
        if (n[c] in d) {
            return '(symbol ' + string_in_form(this.name) + ')';
        }
    };
    return ':' + this.name;
}

IntSymbol.prototype.to_s_text = function () {
    return this.name;
}

IntSymbol.prototype.get_type = function () {
    return new Type('symbol');
}

IntSymbol.prototype.basic_type = function () {
    return true;
}

IntSymbol.prototype.callable = function () {
    return false;
}

var IntFunction = function (f, s) {
    this.f = f;
    this.s = s;
}

IntFunction.prototype.call = function (params, scope) {
    return this.f(params, scope);
}

IntFunction.prototype.eq = function (y) {
    if (!(y instanceof IntFunction)) {
        return false;
    }
    throw 'Functions cannot be compared!';
}

IntFunction.prototype.get_type = function () {
    return new Type('function');
}

IntFunction.prototype.to_s = function () {
    if (this.s !== undefined) {
        return this.s;
    } else {
        return '*function*';
    }
}

IntFunction.prototype.to_s_text = function () {
    if (this.s !== undefined) {
        return this.s;
    } else {
        throw 'Implementation error: a non-basic function being converted to string.';
    }
}

IntFunction.prototype.basic_type = function () {
    return this.s !== undefined;
}

IntFunction.prototype.callable = function () {
    return true;
}

var negate = new IntFunction(function (b) {
    var x = check_one_arg(b, 'internal function negate');
    return int_bool_from(!js_to_bool(x));
});

var Macro = function (f) {
    this.f = f;
}

Macro.prototype.macro_call = function (params, scope) {
    return this.f(params, scope);
}

Macro.prototype.eq = function (y) {
    if (!(y instanceof Macro)) {
        return false;
    }
    throw 'Macros cannot be compared!';
}

Macro.prototype.get_type = function () {
    return new Type('macro');
}

Macro.prototype.to_s = function () {
    return '*macro*';
}

Macro.prototype.basic_type = function () {
    return false;
}

Macro.prototype.callable = function () {
    return true;
}

var Syntax = function (f) {
    this.f = f;
}

Syntax.prototype.syntax_call = function (params, scope) {
    return this.f(params, scope);
}

Syntax.prototype.eq = function (y) {
    if (!(y instanceof Syntax)) {
        return false;
    }
    throw 'Syntax entities cannot be compared!';
}

Syntax.prototype.get_type = function () {
    return new Type('syntax');
}

Syntax.prototype.to_s = function () {
    return '*syntax*';
}

Syntax.prototype.basic_type = function () {
    return false;
}

Syntax.prototype.callable = function () {
    return true;
}

var List = function (l) {
    this.list = l;
}

List.prototype.car = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty list has no car.'
    }
    return this.list[0];
}

List.prototype.cdr = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty list has no cdr.'
    }
    return new List(this.list.slice(1));
}

List.prototype.cons = function (x) {
    return new List([x].concat(this.list));
}

List.prototype.each = function (f, scope) {
    if (!(f instanceof IntFunction)) {
        throw 'You can only use each with a function.';
    }
    var wrap_f = function (x) {return f.call(new List([x]), scope)};
    this.list.map(wrap_f);
    return new List([]);
}

List.prototype.map = function (f, scope) {
    if (!(f instanceof IntFunction)) {
        throw 'You can only map by a function.';
    }
    var wrap_f = function (x) {return f.call(new List([x]), scope)};
    var result = new List(this.list.map(wrap_f));
    return result;
}

List.prototype.filter = function (f, scope) {
    if (!(f instanceof IntFunction)) {
        throw 'You can only filter by a function.';
    }
    var wrap_f = function (x) {return js_to_bool(f.call(new List([x]), scope))};
    var result = new List(this.list.filter(wrap_f));
    return result;
}

List.prototype.concat = function () {
    return new List([].concat.apply(
        [], this.list.map(function (x) {return x.list})));
}

List.prototype.at = function (index) {
    if (index < 0 || index > this.list.length - 1 ||
        Math.floor(index) !== index) {
        throw 'Issue: impossible array access.'
    }
    return this.list[index];
}

List.prototype.push = function (x) {
    this.list.push(x);
    return x
}

List.prototype.pop = function () {
    if (this.len() === 0) {
        throw 'An empty list cannot be popped from!';
    }
    return this.list.pop();
}

List.prototype.last = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty list has no last item.'
    }
    return this.list[this.list.length - 1];
}

List.prototype.butlast = function () {
    if (this.len() === 0) {
        throw 'Issue: the empty list has no last item to remove.'
    }
    return new List(this.list.slice(0, -1));
}

List.prototype.len = function () {
    return this.list.length;
}

List.prototype.eq = function (y)  {
    if (!(y instanceof List)) {
        return false;
    }
    if (this.list.length !== y.list.length) {
        return false;
    }
    for (var i = 0; i < this.list.length; i++) {
        if (!(this.at(i).eq(y.at(i)))) {
            return false;
        }
    }
    return true;
}

List.prototype.to_s = function () {
    return '[' + this.list.map(function (x) {return x.to_s()}).join(' ') + ']';
}

List.prototype.get_type = function () {
    return new Type('list');
}

List.prototype.basic_type = function () {
    return false;
}

List.prototype.callable = function () {
    return false;
}

var Hash = function () {
    this.parent = null;
    this.hash = new Map();
}

Hash.prototype.basic_type_warn = function (x) {
    if (!x.basic_type()) {
        throw 'Only basic types can be used as keys, not ' + x.to_s() + '.';
    }
}

Hash.prototype.get = function (x) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        if (this.parent === null) {
            throw 'Cannot get parent in ' + this.to_s()
            + ' since it does not exist.';
        }
        return this.parent;
    }
    var s = x.to_s_text();
    var h = this;
    while (true) {
        if (h.hash.has(s)) {
            return h.hash.get(s);
        } else if (h.parent === null) {
            throw 'Cannot get ' + s + ' in ' + this.to_s()
            + ' since it does not exist.';
        } else {
            h = h.parent;
        }
    }
}

Hash.prototype['safe-get'] = function (x) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        if (this.parent === null) {
            return new List([]);
        }
        return new List([this.parent]);
    }
    var s = x.to_s_text();
    var h = this;
    while (true) {
        if (h.hash.has(s)) {
            return new List([h.hash.get(s)]);
        } else if (h.parent === null) {
            return new List([]);
        } else {
            h = h.parent;
        }
    }
}

Hash.prototype.extend = function (x) {
    if (!(x instanceof Hash)) {
        throw 'Cannot extend ' + this.to_s() +
        ' by ' + x.to_s() + ' since it is not a hash.';
    }
    var keys = x.keys().list;
    for (var i = 0; i < keys.length; i++) {
        this.def(keys[i], x.get(keys[i]));
    }
    return x;
}

Hash.prototype.def = function (x, y) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        if (this.parent !== null) {
            throw 'Cannot define parent in ' + this.to_s() +
            'since it already exists; it is ' + this.parent.to_s() + '.';
        } else if (!(y instanceof Hash)) {
            'Cannot define parent in ' + this.to_s() +
            ' to be anything other than a hash, like ' + y.to_s() + '.';
        } else {
            this.parent = y;
        }
    } else {
        var s = x.to_s_text();
        if (this.hash.has(s)) {
            throw 'Cannot define ' + s + ' in ' + this.to_s() +
            ' since it already exists; it is ' + this.hash.get(s).to_s() + '.';
        } else {
            this.hash.set(s, y);
        }
    }
    return y;
}

Hash.prototype.del = function (x) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        if (this.parent === null) {
            throw 'Cannot delete parent in ' + this.to_s() +
            ' since it does not exist.';
        }
        this.parent === null;
    } else {
        var s = x.to_s_text();
        var h = this;
        while (true) {
            if (h.hash.has(s)) {
                h.hash.delete(s);
                break;
            } else if (h.parent === null) {
                throw 'Cannot delete ' + s + ' in ' + this.to_s() +
                ' since it does not exist.';
            } else {
                h = h.parent;
            }
        }
    }
    return new List([]);
}

Hash.prototype.eval = function (x) {
    if (x instanceof IntSymbol) {
        return this.get(x);
    }
    if (!(x instanceof List)) {
        return x;
    }
    if (x.len() === 0) {
        return x;
    }
    var f = this.eval(x.car());
    if (typeof f.get_type !== 'function') {
        throw 'Serious implementation error: cannot get the type of ' + f.to_s() + '!';
    }
    var g = f.get_type();
    var c = x.cdr();
    if (g.is_type(types.function_type)) {
        var self = this;
        var eval_in_scope = new IntFunction(function (args) {
            var y = check_one_arg(args, 'internal evaluator');
            return self.eval(y);
        });
        var args = c.map(eval_in_scope);
        return f.call(args, this);
    } else if (g.is_type(types.macro_type)) {
        return this.eval(f.macro_call(c, this));
    } else if (g.is_type(types.syntax_type)) {
        return f.syntax_call(c, this);
    } else {
        throw 'Illegal function-like value: ' + f.to_s() +
        ', which is the result of evaluating ' + x.car().to_s() +
        ', the head of ' + x.to_s() + '.';
    }
}

Hash.prototype.set = function (x, y) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        if (this.parent === null) {
            throw 'Cannot set parent in ' + this.to_s()
            + ' since it does not exist.';
        } else if (!(y instanceof Hash)) {
            throw 'Cannot set parent in ' + this.to_s() +
            ' to be anything other than a hash, like ' + y.to_s() + '.';
        } else {
            this.parent = y;
        }
    } else {
        var s = x.to_s_text();
        var h = this;
        while (true) {
            if (h.hash.has(s)) {
                h.hash.set(s, y);
                break;
            } else if (h.parent === null) {
                throw 'Cannot set ' + s + ' in ' + this.to_s()
                + ' since it does not exist.';
            } else {
                h = h.parent;
            }
        }
    }
    return y;
}

Hash.prototype['has?'] = function (x) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        return int_bool_from(this.parent === null);
    }
    var s = x.to_s_text();
    var h = this;
    while (true) {
        if (h.hash.has(s)) {
            return new TType();
        } else if (h.parent === null) {
            return new List([]);
        } else {
            h = h.parent;
        }
    }
}

Hash.prototype['has-own?'] = function (x) {
    this.basic_type_warn(x);
    if (x instanceof ParentType) {
        return int_bool_from(this.parent === null);
    }
    var s = x.to_s_text();
    return int_bool_from(this.hash.has(s));
}

Hash.prototype['bind-all'] = function (x, y) {
    if (typeof x.get_type !== 'function') {
        throw 'Serious implementation error: cannot get the type of ' + x.to_s() + '!';
    }
    if (x instanceof IntSymbol) {
        if (x.name === '*') {
            this.extend(y);
        } else {
            this.def(x, y);
        }
        return;
    }
    if (!(x instanceof List)) {
        throw 'The left side of a recursive defintion must be a symbol or list!';
    }

    if (!(y instanceof List)) {
        throw 'The right side of a recursive definition must be a list '
        + 'if the right side is!';
    }

    var i;
    var l = x.len();
    var y_l = y.len();
    var x_i;
    var rest_loc = -1;
    for (i = 0; i < l; i++) {
        x_i = x.at(i);
        if (x_i instanceof List && x_i.car() instanceof IntSymbol
            && x_i.car().name === '&') {
            if (rest_loc !== -1) {
                throw 'Only one rest parameter is allowed!';
            }
            rest_loc = i;
        }
    }
    if (rest_loc === -1) {
        if (l !== y_l) {
            throw 'Both sides of a recursive definition must be ' +
            'lists of equal length, unlike ' + x.to_s() + ' and ' + y.to_s() + '.';
        }

        for (i = 0; i < l; i++) {
            this['bind-all'](x.at(i), y.at(i));
        }
    } else {
        if (y_l < l - 1) {
            throw 'Even with an empty rest parameter, the right side is too short! (Sides: ' +
                x.to_s() + ' and ' + y.to_s() + '.)';
        }

        for (i = 0; i < rest_loc; i++) {
            this.def(x.at(i), y.at(i));
        }

        this['bind-all'](x.at(i).at(1), new List(y.list.slice(
            rest_loc, y_l + rest_loc - l + 1)));

        for (i = 1; i < l - rest_loc; i++) {
            this['bind-all'](x.at(i + rest_loc), y.at(y_l + rest_loc - l + i));
        }
    }
    return y;
}

Hash.prototype.hash_len = function () {
    return this.hash.size;
}

Hash.prototype.len = function () {
    var r = this.hash_len();
    if (this.parent !== null) {
        r++;
    }
    return r;
}

var list_from_it_b = function (iter) {
    var n = iter.next();
    var l = [];
    while (!n.done) {
        l.push(n.value);
        n = iter.next();
    }
    return new List(l);
}

var list_from_it = function (iter, f) {
    var n = iter.next();
    var l = [];
    while (!n.done) {
        l.push(f(n.value));
        n = iter.next();
    }
    return new List(l);
}

Hash.prototype.keys = function () {
    var l = list_from_it(this.hash.keys(), function (x) {
        return new IntString(x);
    });
    if (this.parent !== null) {
        l.push(new ParentType());
    }
    return l;
}

Hash.prototype.pairs = function () {
    var h = this.hash;
    var l = list_from_it(this.hash.keys(), function (x) {
        return new List([new IntString(x), h.get(x)]);
    });
    if (this.parent !== null) {
        l.push(new List([new ParentType(), this.parent]));
    }
    return l;
}

Hash.prototype.values = function () {
    var h = this.hash;
    var l = list_from_it_b(this.hash.values());
    if (this.parent !== null) {
        l.push(this.parent);
    }
    return l;
}

Hash.prototype.eq = function (y)  {
    if (!(y instanceof Hash)) {
        return false;
    }
    if (this.hash_len() !== y.hash_len()) {
        return false;
    }
    var xs;
    var ys;
    for (var i in this.hash) {
        xs = this['safe-get'](new IntString(i));
        ys = y['safe-get'](new IntString(i));
        if (!xs.eq(ys)) {
            return false;
        }
    }
    if (this.parent === null && y.parent === null) {
        return true;
    }
    if (this.parent === null || y.parent === null) {
        return false;
    }
    return this.parent.eq(y.parent);
}

Hash.prototype.to_s = function () {
    if (this.len() === 0) {
        return '(hash)';
    }
    var self = this;
    var hash_key_show = function (s) {
        return '[' + s.to_s() + ' ' + self.get(s).to_s() + ']';
    };
    var l = this.keys();
    var mapped = l.list.map(hash_key_show);
    return '(hash ' + mapped.join(' ') + ')';
}

Hash.prototype.get_type = function () {
    return new Type('hash');
}

Hash.prototype.basic_type = function () {
    return false;
}

Hash.prototype.callable = function () {
    return false;
}

var Type = function (x) {
    this.type = x;
}

Type.prototype.is_type = function (y) {
    if (!(y instanceof Type)) {
        return false;
    }
    return this.type === y.type;
}

Type.prototype.eq = Type.prototype.is_type;

Type.prototype.get_type = function () {
    return new Type('type');
}

Type.prototype.to_s = function () {
    return '(type-from ' + new IntString(this.type).to_s() + ')';
}

Type.prototype.to_s_text = function () {
    return this.type;
}

Type.prototype.basic_type = function () {
    return true;
}

Type.prototype.callable = function () {
    return false;
}

var types = {
    t_type: new Type('t'),
    parent_type: new Type('parent'),
    number_type: new Type('number'),
    string_type: new Type('string'),
    symbol_type: new Type('symbol'),
    list_type: new Type('list'),
    hash_type: new Type('hash'),
    type_type: new Type('type'),
    function_type: new Type('function'),
    macro_type: new Type('macro'),
    syntax_type: new Type('syntax')
}

module.exports = {
    'TType': TType,
    'ParentType': ParentType,
    'IntNumber': IntNumber,
    'IntString': IntString,
    'IntSymbol': IntSymbol,
    'IntFunction': IntFunction,
    'Macro': Macro,
    'Syntax': Syntax,
    'List': List,
    'Hash': Hash,
    'Type': Type,
    'types': types,
    'string_in_form': string_in_form,
    'escapes': escapes,
    'int_bool_from': int_bool_from,
    'js_to_bool': js_to_bool,
    'negate': negate,
    'check_one_arg': check_one_arg
}