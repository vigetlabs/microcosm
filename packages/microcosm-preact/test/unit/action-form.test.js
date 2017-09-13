import { h } from 'preact'
import { mount } from '../helpers'
import { Action } from 'microcosm'
import ActionForm from '../../src/action-form'

describe('callbacks', function() {
  it('executes onDone when that action completes', function() {
    const onDone = jest.fn()
    const send = n => new Action(n).resolve(true)

    const form = mount(<ActionForm action="test" onDone={onDone} send={send} />)

    form.dispatchEvent(new Event('submit'))

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function() {
    const onError = jest.fn()
    const send = n => new Action(n).reject('bad')

    const form = mount(
      <ActionForm action="test" onError={onError} send={send} />
    )

    form.dispatchEvent(new Event('submit'))

    expect(onError).toHaveBeenCalledWith('bad')
  })

  it('executes onOpen when that action opens', function() {
    const onOpen = jest.fn()
    const action = new Action(n => n)
    const send = n => action

    const form = mount(<ActionForm action="test" onOpen={onOpen} send={send} />)

    form.dispatchEvent(new Event('submit'))

    action.open('open')

    expect(onOpen).toHaveBeenCalledWith('open')
  })

  it('executes onUpdate when that action sends an update', function() {
    const onUpdate = jest.fn()
    const action = new Action(n => n)
    const send = n => action

    const form = mount(
      <ActionForm action="test" onUpdate={onUpdate} send={send} />
    )

    form.dispatchEvent(new Event('submit'))

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an action', function() {
    const onDone = jest.fn()
    const send = n => true

    const form = mount(<ActionForm action="test" onDone={onDone} send={send} />)

    form.dispatchEvent(new Event('submit'))

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onDone if not given an action', function() {
    const onError = jest.fn()
    const send = n => true

    const form = mount(
      <ActionForm action="test" onError={onError} send={send} />
    )

    form.dispatchEvent(new Event('submit'))

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function() {
    const onUpdate = jest.fn()
    const send = n => true

    const form = mount(
      <ActionForm action="test" onUpdate={onUpdate} send={send} />
    )

    form.dispatchEvent(new Event('submit'))

    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('manual operation', function() {
  it('submit can be called directly on the component instance', function() {
    const onDone = jest.fn()
    const send = n => new Action(n => n).resolve(true)

    const form = mount(<ActionForm action="test" onDone={onDone} send={send} />)

    form.dispatchEvent(new Event('submit'))

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function() {
    const send = jest.fn()
    const form = mount(<ActionForm send={send} />)

    form.dispatchEvent(new Event('submit'))

    expect(send).toHaveBeenCalled()
  })
})

describe('prepare', function() {
  it('can prepare serialized data', function() {
    const send = jest.fn()

    const prepare = function(params) {
      params.name = 'BILLY'
      return params
    }

    const form = mount(
      <ActionForm action="test" prepare={prepare} send={send}>
        <input name="name" defaultValue="Billy" />
      </ActionForm>
    )

    form.dispatchEvent(new Event('submit'))

    expect(send).toHaveBeenCalledWith('test', { name: 'BILLY' })
  })
})
