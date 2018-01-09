import React from 'react'
import { Microcosm, Observable, Subject } from 'microcosm'
import { ActionButton } from 'microcosm-react'
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
    let send = action => repo.push(action, true)
    let onStart = jest.fn()

    let button = mount(
      <ActionButton action="test" onStart={onStart} send={send} />
    )

    button.simulate('click')

    expect(onStart).toHaveBeenCalledWith(true, { origin: repo })
  })

  it('executes onComplete when that action completes', function() {
    let repo = new Microcosm()
    let send = action => repo.push(action, true)
    let onComplete = jest.fn()

    mount(
      <ActionButton action="test" send={send} onComplete={onComplete} />
    ).simulate('click')

    expect(onComplete).toHaveBeenCalledWith(true, { origin: repo })
  })

  it('executes onError when that action completes', function() {
    let repo = new Microcosm()
    let send = () => repo.push(() => action => action.error('bad'))
    let onError = jest.fn()

    let button = mount(<ActionButton send={send} onError={onError} />)

    button.simulate('click')

    expect(onError).toHaveBeenCalledWith('bad', { origin: repo })
  })

  it('executes onNext when that action sends an update', function() {
    let repo = new Microcosm()
    let onNext = jest.fn()
    let action = repo.push(() => action => {})

    let button = mount(<ActionButton onNext={onNext} send={() => action} />)

    button.simulate('click')

    action.next('loading')

    expect(onNext).toHaveBeenCalledWith('loading', { origin: repo })
  })

  it('executes onUnsubscribe when that action is cancelled', function() {
    let repo = new Microcosm()
    let onUnsubscribe = jest.fn()
    let send = () => repo.push(() => action => action.unsubscribe())

    let button = mount(
      <ActionButton send={send} onUnsubscribe={onUnsubscribe} />
    )

    button.simulate('click')

    expect(onUnsubscribe).toHaveBeenCalledWith(null, { origin: repo })
  })

  it('passes along onClick', function() {
    let handler = jest.fn()
    let send = () => {}

    let button = mount(<ActionButton send={send} onClick={handler} />)

    button.simulate('click')

    expect(handler).toHaveBeenCalled()
  })

  it('executes prepare with the event and value before pushing the action', function() {
    let handler = jest.fn()
    let send = () => {}
    let button = mount(<ActionButton prepare={handler} send={send} />)

    button.simulate('click')

    expect(handler).toHaveBeenCalled()
  })

  it('removes action callbacks when the component unmounts', async function() {
    let repo = new Microcosm()
    let action = repo.push(() => action => {})
    let send = jest.fn(() => action)
    let onComplete = jest.fn()

    let button = mount(
      <ActionButton action="test" onComplete={onComplete} send={send} />
    )

    button.simulate('click')

    expect(send).toHaveBeenCalled()

    button.unmount()

    await action.complete(true)

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
          send: action => repo.push(action, true)
        }
      }
    )

    button.instance().click()

    expect(onComplete).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function() {
    let send = jest.fn()
    let button = mount(<ActionButton action="test" send={send} />)

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
