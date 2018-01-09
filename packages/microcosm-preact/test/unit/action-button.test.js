import { Observable, Subject } from 'microcosm'
import { h } from 'preact'
import { mount, unmount } from '../helpers'
import { ActionButton, Presenter } from '../../src/index'

describe('context', function() {
  it('collects send from a presenter', function() {
    expect.assertions(1)

    const test = jest.fn()

    class TestCase extends Presenter {
      intercept() {
        return { test }
      }

      render() {
        return <ActionButton action="test" />
      }
    }

    mount(<TestCase />).click()

    expect(test).toHaveBeenCalled()
  })
})

describe('actions', function() {
  it('passes the value property as parameters into the action', function() {
    let send = jest.fn()

    let button = mount(<ActionButton action="test" value={true} send={send} />)

    button.click()

    expect(send).toHaveBeenCalledWith('test', true)
  })
})

describe('callbacks', function() {
  it('executes onStart when that action completes', function() {
    let onStart = jest.fn()
    let send = () => Observable.of(true)
    let button = mount(
      <ActionButton action="test" send={send} onStart={onStart} />
    )

    button.click()

    expect(onStart).toHaveBeenCalledWith(true)
  })

  it('executes onDone when that action completes', function() {
    let onDone = jest.fn()
    let send = () => {
      let subject = new Subject()

      subject.resolve(true)

      return subject
    }

    let button = mount(
      <ActionButton action="test" onDone={onDone} send={send} />
    )

    button.click()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function() {
    let onError = jest.fn()
    let send = () => new Subject().error(true)
    let button = mount(
      <ActionButton action="test" onError={onError} send={send} />
    )

    button.click()

    expect(onError).toHaveBeenCalledWith(true)
  })

  it('executes onUpdate when that action sends an update', function() {
    let onUpdate = jest.fn()
    let action = new Subject()
    let send = () => action
    let button = mount(
      <ActionButton action="test" onUpdate={onUpdate} send={send} />
    )

    button.click()

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an action', function() {
    let onDone = jest.fn()
    let send = () => true
    let button = mount(
      <ActionButton action="test" onDone={onDone} send={send} />
    )

    button.click()

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onError if not given an action', function() {
    let onError = jest.fn()
    let send = () => true
    let button = mount(
      <ActionButton action="test" onError={onError} send={send} />
    )

    button.click()

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function() {
    let onUpdate = jest.fn()
    let send = () => true
    let button = mount(
      <ActionButton action="test" onUpdate={onUpdate} send={send} />
    )

    button.click()

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('passes along onClick', function() {
    let handler = jest.fn()
    let send = () => {}
    let button = mount(<ActionButton onClick={handler} send={send} />)

    button.click()

    expect(handler).toHaveBeenCalled()
  })

  it('removes action callbacks when the component unmounts', async function() {
    const action = new Subject()(() => Promise.resolve(true))
    const send = jest.fn(() => action)
    const onDone = jest.fn()

    const button = mount(
      <ActionButton action="test" onDone={onDone} send={send} />
    )

    button.click()

    expect(send).toHaveBeenCalled()

    unmount(button)

    await action.execute([])

    expect(action.status).toBe('resolve')
    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not invoke send if there is no action', function() {
    const send = jest.fn()
    const button = mount(<ActionButton send={send} />)

    button.click()

    expect(send).not.toHaveBeenCalled()
  })
})

describe('manual operation', function() {
  it('click can be called directly on the component instance', function() {
    let onDone = jest.fn()
    let send = () => new Subject().resolve(true)

    let button = mount(
      <ActionButton action="test" onDone={onDone} send={send} />
    )

    button.click()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function() {
    const send = jest.fn()
    const button = mount(<ActionButton action="test" send={send} />)

    button.click()

    expect(send).toHaveBeenCalled()
  })
})

describe('mounting', function() {
  it('can mount with another tag name', function() {
    let link = mount(<ActionButton tag="a" action="wut" />)

    expect(link.tagName).toBe('A')
  })

  it('uses the button type when set as a button', function() {
    let button = mount(<ActionButton action="wut" />)

    expect(button.type).toBe('button')
  })

  it('does not pass the type attribute for non-buttons', function() {
    let link = mount(<ActionButton tag="a" action="wut" />)

    expect(link.getAttribute('type')).toBe(null)
  })
})
