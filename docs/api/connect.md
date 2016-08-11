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

When no arguments are passed to `connect`, it will simply make the
instance of Microcosm provided to `<Provider />` available as an `repo`
prop.

```javascript
var repo = new Microcosm()

var connection = connect()

var RepoToJSON = connection(React.createClass({
  render() {
    // this component will have access to the application
    // via this.props.repo
    return { JSON.stringify(this.props.repo) }
  }
}))

ReactDOM.render((
  <Provider repo={ repo }>
    <RepoToJSON />
  </Provider>
), element)
```

### Computed Properties

When a function is provided to `connect`, in addition to providing an
`repo` property to a wrapped component, it will take a returned set of
key/value pairs and compute them based upon repo state. If these
properties do not change, they will not be sent to the wrapped
component.

```javascript
var repo = new Microcosm()

var connection = connect(function (props) {
  return {
    planets: state => state.planets
  }
})

var Planets = connection(React.createClass({
  render() {
    var { repo, planets } = this.props

    return (
      <ul>
        { planets.map(planet => (<li>{ planet.name }</li>)) }
      </ul>
    )
  }
}))

ReactDOM.render((
  <Provider repo={ repo }>
    <Planets />
  </Provider>
), element)
```

## Testing

Optionally, connected React components do not require a `<Provider />`
wrapper. By passing an `repo` prop into a connected component, it will
draw the repo instance from `props` rather than `context`. This makes
it much easier to set up tests:

```javascript
it ('[test description]', function() {
  let repo = new Microcosm()

  repo.replace(fixtureData)

  let component = (<Component repo={ repo } />)

  // Perform your test using the stub application
})
```
