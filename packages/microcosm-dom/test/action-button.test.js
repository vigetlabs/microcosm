import React from 'react'
import { Microcosm } from 'microcosm'
import { ActionButton } from 'microcosm-dom/react'
import { mount, unmount } from './helpers'

describe('ActionButton', function() {
  it('passes the value property as parameters into the action', function() {
    let send = jest.fn()
    let button = mount(<ActionButton action="test" value={true} send={send} />)

    button.click()

    expect(send).toHaveBeenCalledWith('test', true)
  })

  it('executes onSend when that action starts', function() {
    let repo = new Microcosm()
    let send = action => repo.push(action, true)
    let onSend = jest.fn()

    let button = mount(
      <ActionButton action="test" onSend={onSend} send={send} />
    )

    button.click()

    expect(onSend).toHaveBeenCalledWith(repo.history.head)
  })

  it('executes onComplete when that action completes', function() {
    let repo = new Microcosm()
    let send = action => repo.push(action, true)
    let onComplete = jest.fn()

    mount(
      <ActionButton action="test" send={send} onComplete={onComplete} />
    ).click()

    expect(onComplete).toHaveBeenCalledWith(repo.history.head)
  })

  it('executes onError when that action completes', function() {
    let repo = new Microcosm()
    let send = () => repo.push(() => action => action.error('bad'))
    let onError = jest.fn()

    let button = mount(<ActionButton send={send} onError={onError} />)

    button.click()

    expect(onError).toHaveBeenCalledWith(repo.history.head)
  })

  it('executes onNext when that action sends an update', function() {
    let repo = new Microcosm()
    let onNext = jest.fn()
    let action = repo.push(() => action => {})

    let button = mount(<ActionButton onNext={onNext} send={() => action} />)

    button.click()

    action.next('loading')

    expect(onNext).toHaveBeenCalledWith(repo.history.head)
  })

  it('executes onCancel when that action is cancelled', function() {
    let repo = new Microcosm()
    let onCancel = jest.fn()
    let send = () => repo.push(() => action => action.cancel())

    let button = mount(<ActionButton send={send} onCancel={onCancel} />)

    button.click()

    expect(onCancel).toHaveBeenCalledWith(repo.history.head)
  })

  it('passes along onClick', function() {
    let handler = jest.fn()
    let send = () => {}

    let button = mount(<ActionButton send={send} onClick={handler} />)

    button.click()

    expect(handler).toHaveBeenCalled()
  })

  it('executes prepare with the event and value before pushing the action', function() {
    let handler = jest.fn()
    let send = () => {}
    let button = mount(<ActionButton prepare={handler} send={send} />)

    button.click()

    expect(handler).toHaveBeenCalled()
  })

  it('removes action callbacks when the component unmounts', function() {
    let repo = new Microcosm()
    let action = repo.push(() => action => {})
    let send = jest.fn(() => action)
    let onComplete = jest.fn()

    let button = mount(
      <ActionButton action="test" onComplete={onComplete} send={send} />
    )

    button.click()

    expect(send).toHaveBeenCalled()

    unmount(button)
    action.complete(true)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('can pass in send manually', function() {
    let send = jest.fn()
    let button = mount(<ActionButton action="test" send={send} />)

    button.click()

    expect(send).toHaveBeenCalled()
  })

  it('can call click directly', function() {
    let send = jest.fn()

    class Test extends React.Component {
      componentDidMount() {
        this.el.click()
      }
      render() {
        return (
          <ActionButton action={test} send={send} ref={el => (this.el = el)}>
            Test
          </ActionButton>
        )
      }
    }

    mount(<Test />)

    expect(send).toHaveBeenCalled()
  })

  it('can render with another tag name', function() {
    let wrapper = mount(<ActionButton tag="a" action="wut" />)

    expect(wrapper.tagName).toBe('A')
  })

  it('inherits send from context', function() {
    let send = jest.fn()

    class Test extends React.Component {
      static childContextTypes = {
        send: () => {}
      }
      getChildContext() {
        return { send }
      }
      render() {
        return <ActionButton action={test}>Test</ActionButton>
      }
    }

    mount(<Test />).click()

    expect(send).toHaveBeenCalled()
  })
})
