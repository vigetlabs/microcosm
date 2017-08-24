/**
 * @jest-environment jsdom
 */

import React from 'react'
import ActionForm from '../../src/addons/action-form'
import Presenter from '../../src/addons/presenter'
import mockSend from '../helpers/mock-send'
import Microcosm from '../../src/microcosm'
import { mount } from 'enzyme'

describe('callbacks', function() {
  it('executes onDone when that action completes', function() {
    const repo = new Microcosm()
    const reply = action => repo.push(action, true)
    const onDone = jest.fn()

    const form = mount(
      <ActionForm action="test" onDone={onDone} send={reply} />
    )

    form.simulate('submit')

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function() {
    const repo = new Microcosm()
    const reply = action => repo.append(action).reject('bad')
    const onError = jest.fn()

    const form = mount(
      <ActionForm action="test" onError={onError} send={reply} />
    )

    form.simulate('submit')

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onOpen when that action opens', function() {
    const repo = new Microcosm()
    const reply = action => repo.append(action).open('open')
    const onOpen = jest.fn()

    const form = mount(
      <ActionForm action="test" onOpen={onOpen} send={reply} />
    )

    form.simulate('submit')

    expect(onOpen).toHaveBeenCalledWith('open')
  })

  it('executes onUpdate when that action sends an update', function() {
    const repo = new Microcosm()
    const action = repo.append('test')
    const reply = () => action
    const onUpdate = jest.fn()

    const form = mount(
      <ActionForm action="test" onUpdate={onUpdate} send={reply} />
    )

    form.simulate('submit')

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute callbacks if not given an action', function() {
    const onDone = jest.fn()

    const form = mount(
      <ActionForm action="test" onDone={onDone} send={() => null} />
    )

    form.simulate('submit')

    expect(onDone).not.toHaveBeenCalled()
  })
})

describe('context', function() {
  it('inherits send from context', function() {
    const repo = new Microcosm()
    const onDone = jest.fn()

    const form = mount(
      <ActionForm action="test" onDone={onDone} />,
      mockSend(action => repo.push(action, true))
    )

    form.simulate('submit')

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('send as a prop overrides context', function() {
    const repo = new Microcosm()
    const reply = action => repo.push(action, 'from-prop')
    const onDone = jest.fn()

    const form = mount(
      <ActionForm action="test" onDone={onDone} send={reply} />,
      mockSend(action => repo.push(action, 'from-context'))
    )

    form.simulate('submit')

    expect(onDone).toHaveBeenCalledWith('from-prop')
  })
})

describe('manual operation', function() {
  it('submit can be called directly on the component instance', function() {
    const repo = new Microcosm()
    const reply = action => repo.push(action, true)
    const onDone = jest.fn()

    const form = mount(
      <ActionForm action="test" onDone={onDone} send={reply} />
    )

    form.instance().submit()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function() {
    const send = jest.fn()
    const form = mount(<ActionForm send={send} />)

    form.instance().submit()

    expect(send).toHaveBeenCalled()
  })
})

describe('serialization', function() {
  it('extracts form data', function() {
    const action = jest.fn()

    const form = mount(
      <Presenter>
        <ActionForm action={action}>
          <input name="text" defaultValue="Hello, world" />
        </ActionForm>
      </Presenter>
    )

    form.simulate('submit')

    expect(action).toHaveBeenCalledWith({ text: 'Hello, world' })
  })

  it('can preprocess serialized data', function() {
    const action = jest.fn()

    const prepare = function(params) {
      params.name = 'BILLY'
      return params
    }

    const form = mount(
      <Presenter>
        <ActionForm action={action} prepare={prepare}>
          <input name="name" defaultValue="Billy" />
        </ActionForm>
      </Presenter>
    )

    form.simulate('submit')

    expect(action).toHaveBeenCalledWith({ name: 'BILLY' })
  })

  it.dev('will not submit an unmounted form', function() {
    const form = mount(<ActionForm send={jest.fn()} />)

    let instance = form.instance()

    form.unmount()

    expect(function() {
      instance.submit()
    }).toThrow(/ActionForm has no form reference and can not submit/)
  })
})
