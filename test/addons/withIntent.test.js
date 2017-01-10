import React from 'react'
import withIntent from '../../src/addons/with-intent'
import logger from '../helpers/logger'
import {mount} from 'enzyme'

test('extracts send from context', function () {
  const Button = withIntent(function ({ send }) {
    return (
      <button type="button" onClick={() => send('intent')}>Click me</button>
    )
  })

  const send = jest.fn()

  const component = mount(<Button />, {
    context: { send },
    childContextTypes: {
      send: React.PropTypes.func
    }
  })

  component.simulate('click')

  expect(send).toHaveBeenCalledWith('intent')
})

test('allows send to be overridden by a prop', function () {
  const send = jest.fn()

  const Button = withIntent(function ({ send }) {
    return (
      <button type="button" onClick={() => send('intent')}>
        Click me
      </button>
    )
  })

  mount(<Button send={send}/>).simulate('click')

  expect(send).toHaveBeenCalledWith('intent')
})

describe('When there is no context (called directly as a function)', function () {

  beforeEach(function () {
    logger.record()
  })

  afterEach(function() {
    logger.restore()
  })

  test('safely degrades to an error reporting message', function () {
    const Button = withIntent(function Button ({ send }) {
      return (
        <button type="button" onClick={() => send('intent', true)}>Click me</button>
      )
    })

    mount(Button()).simulate('click')

    expect(logger.last('error')).toContain('Unable to broadcast "intent" with parameters `true`.')
  })

  test('uses the component name in the debug message for stateless components', function () {
    const Button = withIntent(function Button ({ send }) {
      return (
        <button type="button" onClick={() => send('intent')}>Click me</button>
      )
    })

    Button()

    expect(logger.last('error')).toContain('withIntent(Button)')
  })

})

describe('Display name', function () {

  test('sets the correct display name for stateless components', function () {
    const Button = withIntent(function Button () {
      return <button type="button" />
    })

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withIntent(Button)')).toHaveLength(1)
  })

  test('sets the correct display name for stateful components', function () {
    const Button = withIntent(class Button extends React.Component {
      render () {
        return <button type="button" />
      }
    })

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withIntent(Button)')).toHaveLength(1)
  })

})
