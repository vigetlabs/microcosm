import React from 'react'
import Form from '../../src/addons/form'
import Action from '../../src/action'
import {mount} from 'enzyme'

describe('callbacks', function () {
  it('executes onDone when that action completes', function () {
    const onDone = jest.fn()

    const form = mount(<Form intent="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => new Action(n => n).resolve(true)
      }
    })

    form.simulate('submit')

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function () {
    const onError = jest.fn()

    const form = mount(<Form intent="test" onError={n => onError(n)} />, {
      context: {
        send: () => new Action(n => n).reject('bad')
      }
    })

    form.simulate('submit')

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onUpdate when that action sends an update', function () {
    const onUpdate = jest.fn()
    const action = new Action(n => n)

    const form = mount(<Form intent="test" onUpdate={n => onUpdate(n)} />, {
      context: {
        send: () => action
      }
    })

    form.simulate('submit')

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an action', function () {
    const onDone = jest.fn()

    mount(<Form intent="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('submit')

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onDone if not given an action', function () {
    const onError = jest.fn()

    mount(<Form intent="test" onError={n => onError(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('submit')

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function () {
    const onUpdate = jest.fn()

    mount(<Form intent="test" onUpdate={n => onUpdate(n)} />, {
      context: {
        send: () => true
      }
    }).simulate('submit')

    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('manual operation', function () {

  it('submit can be called directly on the component instance', function () {
    const onDone = jest.fn()

    const form = mount(<Form intent="test" onDone={n => onDone(n)} />, {
      context: {
        send: () => new Action(n => n).resolve(true)
      }
    })

    form.instance().submit()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function () {
    const send = jest.fn()
    const form = mount(<Form send={send} />)

    form.simulate('submit')

    expect(send).toHaveBeenCalled()
  })

})

describe ('prepare', function() {

  it('can prepare serialized data', function () {
    const send = jest.fn()

    const prepare = function (params) {
      params.name = "BILLY"

      return params
    }

    const form = mount((
        <Form intent="test" prepare={prepare}>
        <input name="name" defaultValue="Billy"/>
        </Form>
    ), { context: { send } })

    form.instance().submit()

    expect(send).toHaveBeenCalledWith("test", { name: "BILLY" })
  })

})
