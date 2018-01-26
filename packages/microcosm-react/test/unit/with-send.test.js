import React from 'react'
import { Presenter, withSend } from 'microcosm-react'
import { mount } from 'enzyme'

it('exposes the wrapped component as a static property', function() {
  function Button({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  }

  let WrappedButton = withSend(Button)

  expect(WrappedButton.WrappedComponent).toEqual(Button)
})

it('extracts send from context', function() {
  let Button = withSend(function Button({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  })

  let handler = jest.fn()

  class Test extends Presenter {
    intercept() {
      return { action: handler }
    }
    render() {
      return <Button />
    }
  }

  mount(<Test />).simulate('click')

  expect(handler).toHaveBeenCalled()
})

it('allows send to be overridden by a prop', function() {
  let send = jest.fn()

  let Button = withSend(function({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  })

  mount(<Button send={send} />).simulate('click')

  expect(send).toHaveBeenCalledWith('action')
})

describe('Display name', function() {
  it('sets the correct display name for stateless components', function() {
    let Button = withSend(function Button() {
      return <button type="button" />
    })

    expect(Button.displayName).toEqual('withSend(Button)')
  })

  it('sets the correct display name for stateful components', function() {
    let Button = withSend(
      class Button extends React.Component {
        render() {
          return <button type="button" />
        }
      }
    )

    expect(Button.displayName).toEqual('withSend(Button)')
  })
})
