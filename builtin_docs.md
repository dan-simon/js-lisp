This describes the behavior of builtins. Note that all examples assume nothing has been done before they are tried.

* 1+ adds one to a number. (1+ 2) is 3. inc is an alias for 1+.
* 1- subtracts one from a number. (1- 5) is 4. dec is an alias for 1-.
* ++ adds one to a variable and returns the result. (do (defq a 1) (++ a)) is 2, and a is now 2.
* -- subtracts one from a variable and returns the result. (do (defq b 7) (-- b)) is 6, and a is now also 6.
* random returns a random float between 0 and 1. It uses JavaScript's Math.random(), and will of course generally return different numbers on different calls.
* randint takes a single number and returns Math.floor of a call to random times that number. In particular, given a positive integer x, it will return all non-negative integers less than x with equal probability.
* +, -, *, /, and % are the same as in most languages (such as JavaScript and Python 3).
  * Division is float division.
  * If + or - is given no arguments, it will return 0.
  * If * or / is given no arguments, it will return 1.
  * If + or * is given one argument, it will return that argument.
  * If - or / is given one argument, it will return the negation or reciprocal of that argument, respectively.
  * - and / subtract or divide all their arguments after the first, so (- 8 3 9) is -4 and (/ 9 3 6) is 0.5.
  * % always takes two arguments.
  * % and / throw an error on division by zero.
* ** is exponentiation.
  * It is right-associative: (** 2 3 4) is not 2 to the 12th, it is 2 to the 81st.
  * With no arguments it returns 1.
  * (** 0 0) is 1.
* floor and ceil take the floor or ceiling of a number, respectively. (floor 2.5) is 2 and (ceil 2.5) is 3.
* quote takes an argument and returns that argument unevaluated. (quote a) is :a. (quote (1 2 3)) is [1 2 3]. (quote [1 2 3]) is [:list 1 2 3]. A single quote is used for strings and in no way is related to quote.
* list returns a list of its arguments. (list 1) is [1]. (list 1 2 3) is [1 2 3]. (list [1 2 3]) is [[1 2 3]]. Note that square brackets are equivalent to list.
* exit takes no arguments and exits. If you want to remove this (perhaps you are writing a program that calls random functions and don't want it to be able to end itself) you can use (del :exit). Note that this will not get rid of any copies of exit.
* More to come...