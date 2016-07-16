Here are some important assues with this language.

* Lists are JavaScript lists, not linked lists.
* The repl is one-line at a time. (But you can configure the number of line-breaks needed to trigger the end of an expression.)
* It doesn't have input or file reading, so if you want to use those things you'll have to write glue code in JavaScript.
* It doesn't support comments. (But you can use strings, and strings can be multiline.)
* It doesn't have many comments in the source code.
* I haven't done timing tests, but it's probably really slow: it's interpreted, with no optimizations.
* Unicode suppot is the same as es5 javascript, that is, only the Basic Multilingual Plane.
* It has no tests, and errors pop up once in a while. (There are no known errors right now, but...)
* It has no stack trace for debugging. Just a potentially helpful (or unhelpful) error message.
* The stack overflows if you try to print a circular object. This is currently an uncatchable error.
* When a variable does not exist, the error includes the entire scope. This can be helpful, but it can also be annoying, especially since the stack then overflows if the scope references itself.
* It doesn't have call/cc, proxy objects or read-macros. There are currently no plans to add these.
* It doesn't have dotted lists or built-in gensym.