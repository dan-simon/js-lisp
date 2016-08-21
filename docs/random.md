This file contains documentation of functions involving randomness. It documents 3 builtins.

* random returns a random float between 0 and 1. It uses JavaScript's Math.random(), and will of course generally return different numbers on different calls.
* randint takes a single number and returns Math.floor of a call to random times that number. In particular, given a positive integer x, it will return all non-negative integers less than x with equal probability.
* choice chooses a random item from a list or string.