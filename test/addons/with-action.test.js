import React from 'react'
import withAction from '../../src/addons/with-action'
import logger from '../helpers/logger'
import {mount} from 'enzyme'

test('extracts send from context', function () {
  const Button = withAction(function ({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>Click me</button>
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

  expect(send).toHaveBeenCalledWith('action')
})

test('allows send to be overridden by a prop', function () {
  const send = jest.fn()

  const Button = withAction(function ({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  })

  mount(<Button send={send}/>).simulate('click')

  expect(send).toHaveBeenCalledWith('action')
})

describe('When there is no context (called directly as a function)', function () {

  beforeEach(function () {
    logger.record()
  })

  afterEach(function() {
    logger.restore()
  })

  test('safely degrades to an error reporting message', function () {
    const Button = withAction(function Button ({ send }) {
      return (
        <button type="button" onClick={() => send('action', true)}>Click me</button>
      )
    })

    mount(Button()).simulate('click')

    expect(logger.last('error')).toContain('Unable to broadcast "action" with parameters `true`.')
  })

  test('uses the component name in the debug message for stateless components', function () {
    const Button = withAction(function Button ({ send }) {
      return (
        <button type="button" onClick={() => send('action')}>Click me</button>
      )
    })

    Button()

    expect(logger.last('error')).toContain('withAction(Button)')
  })

})

describe('Display name', function () {

  test('sets the correct display name for stateless components', function () {
    const Button = withAction(function Button () {
      return <button type="button" />
    })

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withAction(Button)')).toHaveLength(1)
  })

  test('sets the correct display name for stateful components', function () {
    const Button = withAction(class Button extends React.Component {
      render () {
        return <button type="button" />
      }
    })

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withAction(Button)')).toHaveLength(1)
  })

})
