

<!-- Start src/microcosm.js -->

## Microcosm(options)

The Microcosm class. You can extend this class with additional methods,
or perform setup within the constructor of a subclass.

Options:

- `maxHistory`. Microcosm maintains a tree of all actions. This is
   how deep that tree should be allowed to grow. Defaults to none
   (-Infinity).

### Params:

* **[object Object]** *options* - Instantiation options.

## getInitialState()

Determines the initial state of the Microcosm instance by
dispatching the `willStart` lifecycle action. This is pure,
calling getInitialState does not produce side-effects.

### Return:

* **Object** State object representing the initial state.

## clean(action)

Microcosm instances maintain a cache of "merged" actions. Actions that are done,
that will never change again. This decision is based upon the `maxHistory` option
provided to a Microcosm instance. This is internal plumbing, you probably should
never call this method directly.

### Params:

* **Action** *action* target action to "clean"

### Return:

* **Boolean** Was the action merged into the state cache?

<!-- End src/microcosm.js -->

