import React from 'react'
import withIntent from '../../src/addons/with-intent'
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
