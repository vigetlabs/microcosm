import React from 'react'
import ActionButton from '../../src/addons/action-button'
import Action from '../../src/action'
import {mount} from 'enzyme'

describe('actions', function () {

  it('passes the value property as paramters into the action', function () {
    let button = mount(<ActionButton action="test" value={true} />, {
      context: {
        send: (action, params) => new Action(action).resolve(params)
      }
    })

    let action = button.instance().click()

    expect(action.behavior.toString()).toEqual('test')
    expect(action.payload).toBe(true)
  })

})

describe('callbacks', function () {

  it('executes onDone when that action completes', function () {
    let onDone = jest.fn()

    let button = mount(<ActionButton action="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => new Action(n => n).resolve(true)
      }
    })

    button.simulate('click')

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function () {
    let onError = jest.fn()

    let button = mount(<ActionButton action="test" onError={n => onError(n)} />, {
      context: {
        send: () => new Action(n => n).reject('bad')
      }
    })

    button.simulate('click')

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onUpdate when that action sends an update', function () {
    let onUpdate = jest.fn()
    let action = new Action(n => n)

    let button = mount(<ActionButton action="test" onUpdate={n => onUpdate(n)} />, {
      context: {
        send: () => action
      }
    })

    button.simulate('click')

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an action', function () {
    let onDone = jest.fn()

    mount(<ActionButton action="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onDone if not given an action', function () {
    let onError = jest.fn()

    mount(<ActionButton action="test" onError={n => onError(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('click')

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function () {
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
        send: () => new Action(n => n).resolve(true)
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

})
