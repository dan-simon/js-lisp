This file contains documentation of functions that do mutation (apart from set and setq). In general, avoiding these makes your program more pure, but they can be quicker than recursion.

This file documents 2 builtins.

* ++ adds one to a variable and returns the result. (do (defq a 1) (++ a)) is 2, and a is now 2.
* -- subtracts one from a variable and returns the result. (do (defq b 7) (-- b)) is 6, and d is now also 6.