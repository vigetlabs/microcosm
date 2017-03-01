import React from 'react'
import withSend from '../../src/addons/with-send'
import logger from '../helpers/logger'
import {mount} from 'enzyme'

it('extracts send from context', function () {
  const Button = withSend(function ({ send }) {
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

it('allows send to be overridden by a prop', function () {
  const send = jest.fn()

  const Button = withSend(function ({ send }) {
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

  it('safely degrades to an error reporting message', function () {
    const Button = withSend(function Button ({ send }) {
      return (
        <button type="button" onClick={() => send('action', true)}>Click me</button>
      )
    })

    mount(Button()).simulate('click')

    expect(logger.last('error')).toContain('Unable to broadcast "action" with parameters `true`.')
  })

  it('uses the component name in the debug message for stateless components', function () {
    const Button = withSend(function Button ({ send }) {
      return (
        <button type="button" onClick={() => send('action')}>Click me</button>
      )
    })

    Button()

    expect(logger.last('error')).toContain('withSend(Button)')
  })

})

describe('Display name', function () {

  it('sets the correct display name for stateless components', function () {
    const Button = withSend(function Button () {
      return <button type="button" />
    })

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withSend(Button)')).toHaveLength(1)
  })

  it('sets the correct display name for stateful components', function () {
    const Button = withSend(class Button extends React.Component {
      render () {
        return <button type="button" />
      }
    })

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withSend(Button)')).toHaveLength(1)
  })

})
