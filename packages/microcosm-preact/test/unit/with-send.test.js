import { h, Component } from 'preact'
import { mount } from '../helpers'
import { withSend } from '../../src'

it('exposes the wrapped component as a static property', function() {
  const Button = function({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  }

  const WrappedButton = withSend(Button)

  expect(WrappedButton.WrappedComponent).toEqual(Button)
})

it('extracts send from context', function() {
  const Button = withSend(function({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  })

  const send = jest.fn()

  const component = mount(<Button send={send} />)

  component.click()

  expect(send).toHaveBeenCalledWith('action')
})

it('allows send to be overridden by a prop', function() {
  const send = jest.fn()

  const Button = withSend(function({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  })

  mount(<Button send={send} />).click()

  expect(send).toHaveBeenCalledWith('action')
})

describe('Display name', function() {
  it('sets the correct display name for stateless components', function() {
    const Button = withSend(function Button() {
      return <button type="button" />
    })

    expect(Button.displayName).toEqual('withSend(Button)')
  })

  it('sets the correct display name for stateful components', function() {
    const Button = withSend(
      class Button extends Component {
        mount() {
          return <button type="button" />
        }
      }
    )

    expect(Button.displayName).toEqual('withSend(Button)')
  })
})
