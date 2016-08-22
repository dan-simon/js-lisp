This file contains documentation of functions that do arithmetic. These functions are pure and work on numbers.

This file currently contains documentation of 17 builtins.

* 1+ adds one to a number. (1+ 2) is 3. inc is an alias for 1+.
* 1- subtracts one from a number. (1- 5) is 4. dec is an alias for 1-.
* +, -, *, and / are the same as in most languages (such as JavaScript and Python 3).
  * Division is float division.
  * If + or - is given no arguments, it will return 0.
  * If * or / is given no arguments, it will return 1.
  * If + or * is given one argument, it will return that argument.
  * If - or / is given one argument, it will return the negation or reciprocal of that argument, respectively.
  * - and / subtract or divide all their arguments after the first, so (- 8 3 9) is -4 and (/ 9 3 6) is 0.5.
  * / throws an error on division by zero.
* // is almost exactly like /, but it takes the floor whenever it does division or reciprocal. So (// 5 2) is 2, and (// 3) is 0.
* % and mod are very similar. They both take two arguments and raise an error if the second is zero. % is remainder, and mod is modulus. This means that the result of % has the same sign as the first argument, but the result of mod has the same sign as the second. Note that % is somewhat more efficient than mod.
* div? takes two arguments and throws an error if the second is 0. Otherwise it checks whether the remainder when dividing is 0, and returns a boolean based on that.
* ** is exponentiation.
  * It is right-associative: (** 2 3 4) is not 2 to the 12th, it is 2 to the 81st.
  * With no arguments it returns 1.
  * (** 0 0) is 1.
* floor and ceil take the floor or ceiling of a number, respectively. (floor 2.5) is 2 and (ceil 2.5) is 3.
* abs takes the absolute value of a number. (abs 2) is 2. (abs -3) is 3. (abs 0) is 0.
* int? checks whether a number is an integer. (int? 3) is t. (int? (** 10 10)) is t. (int? 0) is t. (int? -7) is t. (int? .5) is [].