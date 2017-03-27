# Glossary

**Action:** A function that does some sort of work. Actions are given
to Tasks when created, telling them what the should do. Actions also
identify the type and status of work that a Task is doing.

**Domain:** Microcosms can add Domains to manage a particular piece of
repo state. Whenever a Task's status changes, a Microcosm asks
Domains how it should turn the result of Task's work into new
repo state.

**Effects:** Whenever a Task moves into a new state, Microcosms
dispatch the new state to Effects. Effects can respond and perform
side-effects. A side-effect could be saving data to localStorage, or
tracking unexpected errors.

**History:** Whenever a Microcosm adds a new Task using
`repo.push(action)`, it gets appended to the end of a History object
that contains all prior Tasks. This allows Microcosm to safely
reconcile lots of async changes that might be happening at the same
time, significantly reducing the complexity of things like optimistic
updates.

**repo**: This is what we call an instance of Microcosm. A repo holds
all repo state in a central place, where it is easy to modify
and track.

**repo state:** Each instance of Microcosm (a repo) has a property:
`state`. This is a JavaScript object that contains all data in your
app.

**Task:** A unit of work that needs to be performed. Tasks execute the
action they are created with. Based on the outcome of the action, they
can move into an `open`, `update`, `resolve`, `reject`, and `cancel`
state. As a task's state changes, a Microcosm uses Domains to
determine how it should turn the result of the Task's work into new
repo state. Effects can respond to changes in task states to
perform side-effects, like saving to localStorage or tracking user
behavior using analytics tool.
