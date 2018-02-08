/* @jsx h */

import { h, Component } from 'preact'
import { Presenter, withSend } from 'microcosm-dom/preact'
import { mount } from '../preact-helpers'

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

  mount(<Test />).click()

  expect(handler).toHaveBeenCalled()
})

it('allows send to be overridden by a prop', function() {
  let override = jest.fn()

  let Button = withSend(function({ send }) {
    return (
      <button type="button" onClick={() => send('action')}>
        Click me
      </button>
    )
  })

  mount(<Button send={override} />).click()

  expect(override).toHaveBeenCalledWith('action')
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
      class Button extends Component {
        render() {
          return <button type="button" />
        }
      }
    )

    expect(Button.displayName).toEqual('withSend(Button)')
  })
})
