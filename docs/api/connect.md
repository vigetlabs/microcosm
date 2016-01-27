# Connect

1. [Overview](#overview)
2. [Arguments](#arguments)
3. [Examples](#examples)
4. [Testing](#testing)

## Overview

Used to associate a React component to an instance of
Microcosm. Additionally, it is used to listen for changes in
application state and intelligently propagate computed properties.

This document includes a few examples, however for a more blown out
implementation, consider referencing the ReactRouter example found in
this project.

## Arguments

- `computeFunction`: A function that returns a list of computed properties. See examples for more information
- `options`: An object of settings for the connection
  - `pure`: If true, the connection will only emit a change when a shallow equals check of new computed properties fails.

## Examples

### Simple (no computed properties)

```javascript
var app = new Microcosm()

var AppToJSON = connect(React.createClass({
  render() {
    // this component will have access to the application
    // via this.props.app
    return { JSON.stringify(this.props.app) }
  }
}))

ReactDOM.render((
    <Provider app={ app }>
        <AppToJSON />
    </Provider>
), element)
```

### Computed Properties

```javascript
var app = new Microcosm()

var connection = connect(function (props) {
    return {
        planets: state => state.planets
    }
})

var Planets = connection(React.createClass({
  render() {
    var { app, planets } = this.props

    return (
        <ul>
            { planets.map(planet => (<li>{ planet.name }</li>)) }
        </ul>
    )
}))

ReactDOM.render((
  <Provider app={ app }>
    <Planets />
  </Provider>
), element)
```

## Testing

Optionally, connected React components do not require a `<Provider />`
wrapper. By passing an `app` prop into a connected component, it will
draw the app instance from `props` rather than `context`. This makes
it much easier to set up tests:

```javascript
it ('[test description]', function() {
    let app = new Microcosm()

    app.replace(fixtureData)

    let component = (<Component app={ app } />)

    // Perform your test using the stub application
})
```
