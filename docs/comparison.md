This file documents the basic comparisons. There are 9.

Note: It is potentially possible to create Infinity and NaN. If you do, though, none of this necessarily applies.

* = takes a list of values and returns t if they are all equal or [] if not.
  * It will throw an error if it cannot test two values for equality, that is, if there are two functions that aren't just car/cdr, two macros, or two syntax entities (for example, (= defq setq)).
  * It will return t if given fewer than two values.
* != will simply return the negation of whatever = returns.

For the remaining operators, we must define 'bigger'. The concept only makes sense for numbers, strings, and lists: errors are thrown in other cases.
* For numbers and strings it is as you would expect. Note that numbers and strings can only be compared to values of their own type.
   * Examples: 2 is bigger than 1, 'apply' is bigger than 'apple', 'aardvark' is bigger than 'aa', but 'ab' is bigger than 'aardvark'.
 * For lists, compare element-wise, starting from the beginning, until one of the lists is exhausted. If one of the lists is not exhausted, it is bigger. Otherwise the lists are equal.

Now we can get to the comparison operators.

* <=> wil compare two values. It will return 1 if the first value is bigger, -1 if the second is, and 0 if they are equal.
* All of the other comparison operators return true for fewer than two arguments, and compare each pair, only returning true if all the results are true, when given more.
  * < checks whether the first argument is less than the second.
  * > checks whether the first argument is greater than the second.
  * <= and =< check whether the first argument is less than or equal to the second.
  * >= and => check whether the first argument is greater than or equal to the second.
