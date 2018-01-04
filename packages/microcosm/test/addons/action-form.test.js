/**
 * @jest-environment jsdom
 */

import React from 'react'
import ActionForm from 'microcosm/addons/action-form'
import mockSend from '../helpers/mock-send'
import Microcosm, { Action } from 'microcosm'
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

    expect(onDone).toHaveBeenCalledWith(true, form.getDOMNode())
  })

  it('executes onError when that action completes', function() {
    const repo = new Microcosm()
    const reply = action => repo.append(action).reject('bad')
    const onError = jest.fn()

    const form = mount(
      <ActionForm action="test" onError={onError} send={reply} />
    )

    form.simulate('submit')

    expect(onError).toHaveBeenCalledWith('bad', form.getDOMNode())
  })

  it('executes onOpen when that action opens', function() {
    const repo = new Microcosm()
    const reply = action => repo.append(action).open('open')
    const onOpen = jest.fn()

    const form = mount(
      <ActionForm action="test" onOpen={onOpen} send={reply} />
    )

    form.simulate('submit')

    expect(onOpen).toHaveBeenCalledWith('open', form.getDOMNode())
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

    expect(onUpdate).toHaveBeenCalledWith('loading', form.getDOMNode())
  })

  it('does not execute callbacks if not given an action', function() {
    const onDone = jest.fn()

    const form = mount(
      <ActionForm action="test" onDone={onDone} send={() => null} />
    )

    form.simulate('submit')

    expect(onDone).not.toHaveBeenCalled()
  })

  it('removes action callbacks when the component unmounts', async function() {
    const action = new Action(() => Promise.resolve(true))
    const send = jest.fn(() => action)
    const onDone = jest.fn()

    const form = mount(<ActionForm action="test" onDone={onDone} send={send} />)

    form.simulate('submit')

    expect(send).toHaveBeenCalled()

    form.unmount()

    await action.execute([])

    expect(action).toHaveStatus('resolve')
    expect(onDone).not.toHaveBeenCalled()
  })
})

describe('action submission', function() {
  describe('when there is no action', function() {
    it('does not execute send', function() {
      const send = jest.fn()
      const form = mount(<ActionForm send={send} />)

      form.simulate('submit')

      expect(send).not.toHaveBeenCalled()
    })
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

    expect(onDone).toHaveBeenCalledWith(true, form.getDOMNode())
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

    expect(onDone).toHaveBeenCalledWith('from-prop', form.getDOMNode())
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

    expect(onDone).toHaveBeenCalledWith(true, form.getDOMNode())
  })

  it('can pass in send manually', function() {
    const send = jest.fn()
    const form = mount(<ActionForm action="test" send={send} />)

    form.instance().submit()

    expect(send).toHaveBeenCalled()
  })
})
