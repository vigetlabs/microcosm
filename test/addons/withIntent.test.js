import test from 'ava'
import React from 'react'
import withIntent from '../../src/addons/with-intent'
import {mount} from 'enzyme'

test('extracts send from context', t => {
  t.plan(1)

  const Button = withIntent(function ({ send }) {
    return (
      <button type="button" onClick={() => send('intent')}>Click me</button>
    )
  })

  const component = mount(<Button />, {
    context: {
      send: intent => t.is(intent, 'intent')
    },
    childContextTypes: {
      send: React.PropTypes.func
    }
  })

  component.simulate('click')
})

test('allows send to be overridden by a prop', t => {
  t.plan(1)

  const Button = withIntent(function ({ send }) {
    return (
      <button type="button" onClick={() => send('intent')}>
        Click me
      </button>
    )
  })

  mount(<Button send={intent => t.is(intent, 'intent')}/>).simulate('click')
})
