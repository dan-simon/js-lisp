This is a simple Lisp in JavaScript. It has:

* first-class macros
* first-class syntax (very slightly different from, but as powerful as, fexprs)
* first-class enviroments (as dictionaries/objects/hashes)
* prototype-based inheritance (used to implement scope)

It is a Lisp-1. It mostly has the same features as other lisps, but there are some syntactic differences.

It should work in any environment with es5 + maps, if you remove the main function and input/output stuff. But node is the intended environment.

Why you shouldn't use it for anything important (at least as it is):

The repl is one-line at a time. (But you can configure the number of line-breaks needed to trigger the end of an expression.)
It doesn't have input or file reading, so if you want to use those things you'll have to write glue code in JavaScript.
It doesn't support comments. (But you can use strings, and strings can be multiline.)
It doesn't have many comments in the source code.
I haven't done timing tests, but it's probably really slow: it's interpreted, with no optimizations.
It has no tests, and errors pop up once in a while. (There are no known errors right now, but...)
It has no stack trace for debugging. Just a potentially helpful (or unhelpful) error message.
The stack overflows if you try to print a circular object. This is currently uncatchable.
When a variable does not exist, the error includes the entire scope. This can be helpful, but it can also be annoying, especially since the stack then overflows if the scope references itself.
It doesn't have call/cc, proxy objects or read-macros.

Please report any issues you have or improvements you want to make.