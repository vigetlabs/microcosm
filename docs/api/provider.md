# Provider Component

1. [Overview](#overview)
2. [Props](#props)
3. [Examples](#examples)

## Overview

Microcosm keeps all state in a single, isolated instance. Passing this
instance around within the component hierarchy can often be tedious.

Using `<Provider />` will frame
[React Context API](https://facebook.github.io/react/docs/context.html)
such that all of children components can access their associated
instance of Microcosm.

For information on gaining access to instances of Microcosm in child
components, see the API documentation for `connect`.

## Props

- `repo`: An instance of Microcosm (or a class that extends from it).
- `children`: A single child component. The root of your component tree.

## Examples

### Standard React Rendering

```javascript
var repo = new Microcosm()

ReactDOM.render((
    <Provider repo={ repo }>
        <ChildComponent />
    </Provider>
), element)
```

### React Router (as of 1.0)

```javascript
var repo = new Microcosm()

ReactDOM.render((
  <Provider repo={ repo }>
    <Router history={ history }>...</Router>
  </Provider>
), element)
```
