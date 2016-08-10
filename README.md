This is yet another simple Lisp in JavaScript. It's only here because I wanted to have it out in the world if I ever completely stopped work on it (which I very likely have); it's not intended for any type of use, although it seems to be fun to work with.

The current licence is MIT.

To use it, download the files in it and run the js_lisp_4 file with node. (Yes, versions 1, 2, and 3 existed in the past, but 4 has been around for a long time.)

It has:

* first-class macros
* first-class syntax (very slightly different from, but as powerful as, fexprs)
* first-class enviroments (as dictionaries/objects/hashes)
* prototype-based inheritance (used to implement scope)

It is a Lisp-1 with lexical scope. It mostly has the same features as other lisps, but there are lots of syntactic differences, some of which remove features that should probably have stayed. (See the Syntax Guide.)

It should work in any environment with es5 + maps, if you remove the main function and input/output stuff. But node is the intended environment.

To see lots of important issues, see the important issues file.

Please report any issues you have (or any issues in the important issues file that I seem to not consider important enough), improvements or suggestions you want to make, or any type of comments you have.