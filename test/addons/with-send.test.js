import React from 'react'
import withSend from '../../src/addons/with-send'
import { mount } from 'enzyme'

it('exposes the wrapped component as a static property', function () {
  const Button = function ({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>Click me</button>
    )
  }

  const WrappedButton = withSend(Button)

  expect(WrappedButton.WrappedComponent).toEqual(Button)
})

it('extracts send from context', function () {
  const Button = withSend(function ({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>Click me</button>
    )
  })

  const send = jest.fn()

  const component = mount(<Button />, {
    context:           { send },
    childContextTypes: {
      send: () => {},
    },
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

  mount(<Button send={send} />).simulate('click')

  expect(send).toHaveBeenCalledWith('action')
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
    const Button = withSend(
      class Button extends React.Component {
        render () {
          return <button type="button" />
        }
      },
    )

    let wrapper = mount(<div><Button /></div>)

    expect(wrapper.find('withSend(Button)')).toHaveLength(1)
  })
})
