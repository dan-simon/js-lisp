These builtins don't seem to really fit anywhere else. This file contains documentation on 2 builtins.

* quote takes an argument and returns that argument unevaluated. (quote a) is :a. (quote (1 2 3)) is [1 2 3]. (quote [1 2 3]) is [:list 1 2 3]. A single quote is used for strings and in no way is related to quote.
* exit takes no arguments and exits. If you want to remove this (perhaps you are writing a program that calls random functions and don't want it to be able to end itself) you can use (del :exit). Note that this will not get rid of any copies of exit.