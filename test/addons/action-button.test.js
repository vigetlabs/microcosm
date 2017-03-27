import React from 'react'
import ActionButton from '../../src/addons/action-button'
import Task from '../../src/task'
import {mount} from 'enzyme'

describe('tasks', function () {

  it('passes the value property as parameters into the task', function () {
    let button = mount(<ActionButton action="test" value={true} />, {
      context: {
        send: (type, params) => new Task(type).resolve(params)
      }
    })

    let task = button.instance().click()

    expect(task.command.toString()).toEqual('test')
    expect(task.payload).toBe(true)
  })

})

describe('callbacks', function () {

  it('executes onOpen when that task completes', function () {
    let onOpen = jest.fn()

    let button = mount(<ActionButton action="test" onOpen={n => onOpen(n)} />, {
      context: {
        send: () => new Task(n => n).open(true)
      }
    })

    button.simulate('click')

    expect(onOpen).toHaveBeenCalledWith(true)
  })

  it('executes onDone when that task completes', function () {
    let onDone = jest.fn()

    let button = mount(<ActionButton action="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => new Task(n => n).resolve(true)
      }
    })

    button.simulate('click')

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that task completes', function () {
    let onError = jest.fn()

    let button = mount(<ActionButton action="test" onError={n => onError(n)} />, {
      context: {
        send: () => new Task(n => n).reject('bad')
      }
    })

    button.simulate('click')

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onUpdate when that task sends an update', function () {
    let onUpdate = jest.fn()
    let task = new Task(n => n)

    let button = mount(<ActionButton action="test" onUpdate={n => onUpdate(n)} />, {
      context: {
        send: () => task
      }
    })

    button.simulate('click')

    task.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an task', function () {
    let onDone = jest.fn()

    mount(<ActionButton action="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onDone if not given an task', function () {
    let onError = jest.fn()

    mount(<ActionButton action="test" onError={n => onError(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an task', function () {
    let onUpdate = jest.fn()

    mount(<ActionButton action="test" onUpdate={n => onUpdate(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('passes along onClick', function () {
    let handler = jest.fn()

    let wrapper = mount(<ActionButton onClick={handler} />, {
      context: {
        send: () => {}
      }
    })

    wrapper.simulate('click')

    expect(handler).toHaveBeenCalled()
  })

})

describe('manual operation', function () {

  it('click can be called directly on the component instance', function () {
    let onDone = jest.fn()

    let button = mount(<ActionButton action="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => new Task(n => n).resolve(true)
      }
    })

    button.instance().click()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function () {
    const send = jest.fn()
    const button = mount(<ActionButton send={send} />)

    button.simulate('click')

    expect(send).toHaveBeenCalled()
  })

})

describe('rendering', function () {

  it('can render with another tag name', function () {
    let wrapper = mount(<ActionButton tag="a" action="wut" />)

    expect(wrapper.getDOMNode().tagName).toBe('A')
  })

  it('uses the button type when set as a button', function () {
    let wrapper = mount(<ActionButton action="wut" />)

    expect(wrapper.getDOMNode().type).toBe('button')
  })

  it('does not pass the type attribute for non-buttons', function () {
    let wrapper = mount(<ActionButton tag="a" action="wut" />)

    expect(wrapper.getDOMNode().getAttribute('type')).toBe(null)
  })

})
