The allowed constructions are these:
* Normal parentheses: (+ 2 2) evaluates to 4
* Brackets: [+ 2 2] evaluates to a list with +, 2, and 2. It is equivalent to (list + 2 2).
* Numbers: More or less the same as in javascript. 1, -7, +2.5, 2e-3 are typical examples. There is only one type of number: the javascript one.
* Strings: Single or double quotes. It might have been a bad idea to give sigle quotes to strings instead of using them to quote code, but brackets are often very good substitutes for traditional quote, and when not, quote still exists under that name. Examples of literal strings: 'cat', "dog", 'Some \n \' \t \"escapes"'.
* Symbols: Begin with a colon. Examples: :cat, :foo, :bar, :strange-characters:are*fine¡
* Strings with backslash: Begin with a backslash and require no quotes, but cannot have spaces or escapes. Examples: \foo (equivalent to 'foo'), \bar (equivalent to 'bar'), \\\\\\ (which is a string with two backticks).
* car/cdr literals. Begin with c, have any number of a's or d's, and end with r. Do what they do in lisp; that is, cadr gets the second element of a list. Warning: these are not normal variables and cannot be redefined! They might well have been a big mistake, especially since lists are JavaScript lists, not linked lists.

These are the only types of syntax. There is no special syntax for quote, quasiquote, or unquote. There are no dotted pairs.