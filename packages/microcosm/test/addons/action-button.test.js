/**
 * @jest-environment jsdom
 */

import React from 'react'
import Observable from 'zen-observable'
import Microcosm from 'microcosm'
import ActionButton from 'microcosm/addons/action-button'
import { mount } from 'enzyme'

describe('actions', function() {
  it('passes the value property as parameters into the action', function() {
    let send = jest.fn()

    let button = mount(<ActionButton action="test" value={true} send={send} />)

    button.simulate('click')

    expect(send).toHaveBeenCalledWith('test', true)
  })
})

describe('callbacks', function() {
  it('executes onStart when that action starts', function() {
    let repo = new Microcosm()
    let send = () => repo.push(n => n, true)
    let onStart = jest.fn()

    mount(
      <ActionButton action="test" onStart={onStart} send={send} />
    ).simulate('click')

    expect(onStart).toHaveBeenCalledWith(true)
  })

  it('executes onComplete when that action completes', function() {
    let repo = new Microcosm()
    let send = () => repo.push(n => n, true)
    let onComplete = jest.fn()

    mount(
      <ActionButton action="test" send={send} onComplete={onComplete} />
    ).simulate('click')

    expect(onComplete).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function() {
    let send = () => new Observable(observer => observer.error('bad'))
    let onError = jest.fn()

    mount(
      <ActionButton action="test" send={send} onError={onError} />
    ).simulate('click')

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onUpdate when that action sends an update', function() {
    let repo = new Microcosm()
    let onUpdate = jest.fn()
    let action = repo.append(n => n)

    let button = mount(
      <ActionButton action="test" onUpdate={n => onUpdate(n)} />,
      {
        context: {
          send: () => action
        }
      }
    )

    button.simulate('click')

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('executes onCancel when that action completes', function() {
    let repo = new Microcosm()
    let onCancel = jest.fn()

    let button = mount(
      <ActionButton action="test" onCancel={n => onCancel(n)} />,
      {
        context: {
          send: () => repo.append(n => n).cancel('nevermind')
        }
      }
    )

    button.simulate('click')

    expect(onCancel).toHaveBeenCalledWith('nevermind')
  })

  it('does not execute onComplete if not given an action', function() {
    let onComplete = jest.fn()

    mount(<ActionButton action="test" onComplete={n => onComplete(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('does not execute onError if not given an action', function() {
    let onError = jest.fn()

    mount(<ActionButton action="test" onError={n => onError(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function() {
    let onUpdate = jest.fn()

    mount(<ActionButton action="test" onUpdate={n => onUpdate(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('passes along onClick', function() {
    let handler = jest.fn()

    let wrapper = mount(<ActionButton onClick={handler} />, {
      context: {
        send: () => {}
      }
    })

    wrapper.simulate('click')

    expect(handler).toHaveBeenCalled()
  })

  it('executes prepare with the event and value before pushing the action', function() {
    let handler = jest.fn()

    let wrapper = mount(<ActionButton prepare={handler} />, {
      context: {
        send: () => {}
      }
    })

    wrapper.simulate('click')

    expect(handler).toHaveBeenCalled()
  })

  it('removes action callbacks when the component unmounts', async function() {
    const action = new Observable(observer => observer.complete())
    const send = jest.fn(() => action)
    const onComplete = jest.fn()

    const button = mount(
      <ActionButton action="test" onComplete={onComplete} send={send} />
    )

    button.simulate('click')

    expect(send).toHaveBeenCalled()

    button.unmount()

    await action.execute([])

    expect(action).toHaveStatus('resolve')
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('manual operation', function() {
  it('click can be called directly on the component instance', function() {
    let repo = new Microcosm()
    let onComplete = jest.fn()

    let button = mount(
      <ActionButton action="test" onComplete={n => onComplete(n)} />,
      {
        context: {
          send: () => repo.append(n => n).resolve(true)
        }
      }
    )

    button.instance().click()

    expect(onComplete).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function() {
    const send = jest.fn()
    const button = mount(<ActionButton action="test" send={send} />)

    button.simulate('click')

    expect(send).toHaveBeenCalled()
  })
})

describe('rendering', function() {
  it('can render with another tag name', function() {
    let wrapper = mount(<ActionButton tag="a" action="wut" />)

    expect(wrapper.getDOMNode().tagName).toBe('A')
  })

  it('uses the button type when set as a button', function() {
    let wrapper = mount(<ActionButton action="wut" />)

    expect(wrapper.getDOMNode().type).toBe('button')
  })

  it('does not pass the type attribute for non-buttons', function() {
    let wrapper = mount(<ActionButton tag="a" action="wut" />)

    expect(wrapper.getDOMNode().getAttribute('type')).toBe(null)
  })
})

describe('refs', function() {
  it('can be referenced as a ref', function() {
    let send = jest.fn()

    class Test extends React.Component {
      render() {
        return (
          <ActionButton
            ref={button => (this.button = button)}
            action="test"
            send={send}
          />
        )
      }
    }

    let el = mount(<Test />)

    el.instance().button.click()

    expect(send).toHaveBeenCalledWith('test', null)
  })
})
