This file contains documentation about booleans. It contains documentation on 2 builtins.

* The language has two booleans.
* t is a singleton value of type t. It represents true. It is the value returned by boolean operations when a truthy value is needed (even though every value but the empty list is truthy.)
  * It is not a constant, and it can be redefined without breaking the internal system, although the value true will still print as t.
* The other boolean is the empty list. It represents false. nil is a varible set to the empty list initially. It can also be changed without breaking internal code.
* There are no variables named true and false, just t and nil.*
There is no way to represent true or false as a constant, except by removing set and setq and making it more-or-less impossible to redefine anything, or doing something similar.