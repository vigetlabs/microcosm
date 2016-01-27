# Provider Component

Microcosm keeps all state in a single, isolated instance. Passing this
instance around within the component hierarchy can often be tedious.

Using `<Provider />` will frame
[React Context API](https://facebook.github.io/react/docs/context.html)
such that all of children components can access their associated
instance of Microcosm.

For information on gaining access to instances of Microcosm in child
components, see the API documentation for `connect`.

## Props

- `app`: An instance of Microcosm (or a class that extends from it).
- `children`: A single child component. The root of your component tree.

## Example

### Standard React Rendering

```javascript
var app = new Microcosm()

ReactDOM.render((
    <Provider app={ app }>
        <ChildComponent />
    </Provider>
), element)
```

### React Router (as of 1.0)

```javascript
var app = new Microcosm()

ReactDOM.render((
  <Provider app={ app }>
    <Router history={ history }>...</Router>
  </Provider>
), element)
```
