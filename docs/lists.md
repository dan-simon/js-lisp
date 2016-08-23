This file explains the various functions relating more-or-less directly to lists (and also the few involving strings). There are currently 5 functions documented here, but there are many more function relating to lists that are not yet documented.

* list returns a list of its arguments. (list 1) is [1]. (list 1 2 3) is [1 2 3]. (list [1 2 3]) is [[1 2 3]]. Note that square brackets are equivalent to list.
* concat concatenates its arguments.
  * `(concat [1] [2 3 4] [5 6])` is `[1 2 3 4 5 6]`. (concat []) is [].
* range takes two arguments and returns a list of numbers from its first argument increasing by 1 until the number is no longer less than the second argument.
  * (range 1 7) and (range 1 6.5) are both [1 2 3 4 5 6]`.
  * (range 1 1) is [], as is (range 1 0).
  * Note that ranges are like normal lists: strict, not at all lazy.

And we have two functions (included in the total) that neither take nor return a list, but have to do with them nevertheless.

* apply takes a function/macro/syntax f and makes a version of f that takes one argument and uses its elements as the arguments for f. Note that if f is not a function, the arguments will not be evaluated before f is called at all.
  * Examples: (apply concat) concatenates a list of lists. (apply ~) conncatenates a list of strings. (apply zip) does transposing of a matrix.
  * ((apply quote) (params)) is :params. One can probably guess that using apply with things other than functions is generally not useful.
* splat takes a function/macro/syntax f and makes a version of f that takes all its arguments, puts them in a list, and passes that to f as the only argument.
  * splat not very useful and is mostly included for symmetry with apply. The only cool use I know is that (splat len) returns the number of arguments it gets.