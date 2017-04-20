import React from 'react'
import ActionForm from '../../src/addons/action-form'
import mockSend from '../helpers/mock-send'
import Action from '../../src/action'
import { mount } from 'enzyme'

describe('callbacks', function () {
  it('executes onDone when that action completes', function () {
    const onDone = jest.fn()
    const context = mockSend(n => new Action(n).resolve(true))

    const form = mount(
      <ActionForm action="test" onDone={n => onDone(n)} />,
      context
    )

    form.simulate('submit')

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function () {
    const onError = jest.fn()
    const context = mockSend(n => new Action(n).reject('bad'))

    const form = mount(
      <ActionForm action="test" onError={n => onError(n)} />,
      context
    )

    form.simulate('submit')

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onOpen when that action opens', function () {
    const onOpen = jest.fn()
    const action = new Action(n => n)
    const context = mockSend(n => action)

    const form = mount(
      <ActionForm action="test" onOpen={n => onOpen(n)} />,
      context
    )

    form.simulate('submit')

    action.open('open')

    expect(onOpen).toHaveBeenCalledWith('open')
  })

  it('executes onUpdate when that action sends an update', function () {
    const onUpdate = jest.fn()
    const action = new Action(n => n)
    const context = mockSend(n => action)

    const form = mount(
      <ActionForm action="test" onUpdate={n => onUpdate(n)} />,
      context
    )

    form.simulate('submit')

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an action', function () {
    const onDone = jest.fn()
    const context = mockSend(n => true)

    const form = mount(
      <ActionForm action="test" onDone={n => onDone(n)} />,
      context
    )

    form.simulate('submit')

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onDone if not given an action', function () {
    const onError = jest.fn()
    const context = mockSend(n => true)

    const form = mount(
      <ActionForm action="test" onError={n => onError(n)} />,
      context
    )

    form.simulate('submit')

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function () {
    const onUpdate = jest.fn()
    const context = mockSend(n => true)

    const form = mount(
      <ActionForm action="test" onUpdate={n => onUpdate(n)} />,
      context
    )

    form.simulate('submit')

    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('manual operation', function () {
  it('submit can be called directly on the component instance', function () {
    const onDone = jest.fn()
    const context = mockSend(n => new Action(n => n).resolve(true))

    const form = mount(
      <ActionForm action="test" onDone={n => onDone(n)} />,
      context
    )

    form.instance().submit()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function () {
    const send = jest.fn()
    const form = mount(<ActionForm send={send} />)

    form.instance().submit()

    expect(send).toHaveBeenCalled()
  })
})

describe('prepare', function () {
  it('can prepare serialized data', function () {
    const send = mockSend()

    const prepare = function (params) {
      params.name = 'BILLY'
      return params
    }

    const form = mount(
      <ActionForm action="test" prepare={prepare}>
        <input name="name" defaultValue="Billy" />
      </ActionForm>,
      send
    )

    form.simulate('submit')

    expect(send).toHaveBeenCalledWith('test', { name: 'BILLY' })
  })
})
