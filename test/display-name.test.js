import React from 'react'
import { displayName } from '../src/addons/with-send'

it('gets a stateless component name', function () {
  const name = displayName(function Button () {})

  expect(name).toBe('Button')
})

it('gets a class component name', function () {
  const name = displayName(class Button extends React.PureComponent {})

  expect(name).toBe('Button')
})

it('gets a createClass component name', function () {
  const Button = React.createClass({
    render () {
      var { send } = this.props
      return (
        <button type="button" onClick={() => send('action')}>Click me</button>
      )
    }
  })

  const name = displayName(Button)

  expect(name).toBe('Button')
})

it('uses "Component" when there is no name', function () {
  // eslint-disable-next-line react/display-name
  expect(displayName(React.createClass({
    render () { return <p>Hi</p> }
  }))).toBe('Component')
})
