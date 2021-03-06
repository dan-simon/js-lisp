'use strict';

var js_lisp_types = require('./js_lisp_types_5');

var escapes = js_lisp_types.escapes;

var hex = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'b': 11,
    'c': 12,
    'd': 13,
    'e': 14,
    'f': 15
}

var tokenize_wo_strings = function (s) {
    return s.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').
        replace(/\[/g, ' [ ').replace(/\]/g, ' ] ').split(/[ \t\n]/g).
        filter(function (x) {return x !== ''});
}

var push_string = function (list, string) {
    var len = string.length;
    for (var i = 0; i < len; i++) {
        list.push(string[i]);
    }
}

var find_quotes = function (s) {
    var result = [];
    var len = s.length;
    var item;
    var mode = '';
    var d = {};
    var j = 1;
    var q = [];
    for (var i = 0; i < len; i++) {
        item = s[i];
        if (mode === '') {
            if (item === '\'' || item === '"') {
                mode = item;
            } else {
                result.push(item);
            }
        } else if (mode[1] === '\\') {
            var l_item = item.toLowerCase();
            if (l_item in escapes) {
                q.push(escapes[l_item]);
                mode = mode[0];
            } else if (l_item === 'u') {
                var u_char = 0;
                i++;
                if (!(i < len && s[i].toLowerCase() in hex)) {
                    throw 'Empty Unicode escape.';
                }
                while (i < len && s[i] !== mode[0] && s[i].toLowerCase() in hex) {
                    u_char *= 16;
                    u_char += hex[s[i].toLowerCase()];
                    i++;
                }
                q.push(String.fromCharCode(u_char));
                if (i === len || s[i] !== '.') {
                    i--;
                }
                mode = mode[0];
            } else {
                throw 'Improper escape character ' + item +
                ' (in ' + s + ')\n' + 'In the region ' +
                s.slice(Math.max(0, i - 5), Math.min(s.length, i + 5));
            }
        } else {
            if (item === mode) {
                push_string(result, ' "' + j + ' ');
                d['"' + j] = '"' + q.join('');
                mode = '';
                q = [];
                j++;
            } else if (item === '\\') {
                mode += '\\';
            } else {
                q.push(item);
            }
        }
    }
    if (mode !== '') {
        throw 'Improperly escaped or ended string.';
    }
    return {'string': result.join(''), 'dict': d};
}

var tokenize = function (s) {
    var string_free_s_and_d = find_quotes(s);
    var d = string_free_s_and_d.dict;
    var t = tokenize_wo_strings(string_free_s_and_d.string);
    return t.map(function (x) {return (x[0] === '"') ? d[x] : x});
}

var follow = function (a, b) {
    for (var i = 0; i < b.length; i++) {
        a = a[b[i]];
    }
    return a;
}

var open_close = {'(': ')', '[': ']'}

var values = function (d) {
    var l = [];
    for (var i in d) {
        l.push(d[i]);
    }
    return l;
}

var dict_reverse = function (d) {
    var l = {};
    for (var i in d) {
        l[d[i]] = i;
    }
    return l;
}

var peek = function (x) {
    return x[x.length - 1];
}

var parse = function (l) {
    if (l.length === 0) {
        return null;
    }
    var open_close_reverse = dict_reverse(open_close);
    var parse_tree = [];
    var path = [];
    var paren_path = [];
    for (var i = 0; i < l.length; i++) {
        if (l[i] in open_close && l[i].length === 1) {
            var f = follow(parse_tree, path);
            if (l[i] === '[') {
                f.push(['list']);
            } else {
                f.push([])
            }
            path.push(f.length - 1);
            paren_path.push(l[i]);
        } else if (l[i] in open_close_reverse && l[i].length === 1) {
            if (path.length === 0 ||
                open_close[peek(paren_path)] !== l[i]) {
                throw 'Improperly matched parentheses.';
            }
            path.pop();
            paren_path.pop();
        } else {
            follow(parse_tree, path).push(l[i]);
        }
    }
    if (path.length !== 0) {
        throw 'Leftover open parentheses.';
    }
    if (parse_tree.length === 1) {
        return parse_tree[0];
    }
    throw 'Improper parse tree!';
}

module.exports = {
    'parse': parse,
    'tokenize': tokenize
}