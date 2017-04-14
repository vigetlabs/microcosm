import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action error state', function () {

  it('exposes a error type when rejected', function () {
    const action = new Action(identity)

    action.reject()

    expect(action).toHaveStatus('error')
  })

  it('triggers a error event when it is rejected', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('reject', callback)
    action.reject(404)

    expect(callback).toHaveBeenCalledWith(404)
  })

  it('listens to failures', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.onError(fn)
    action.reject(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('immediately invokes onError if the action already failed', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.reject(true)
    action.onError(fn)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('does not trigger an error event if it is complete', function () {
    const action = new Action(identity)
    const spy = jest.fn()
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    action.on('error', spy)
    action.resolve()
    action.reject()

    expect(warn).toHaveBeenCalledWith('Action "identity" is already in the resolve state. Calling reject() will not change it.')

    expect(spy).not.toHaveBeenCalled()
  })

  it('aliases the done type with reject', function () {
    const action = new Action(identity)

    action.reject()

    expect(action).toHaveStatus('error')
  })

})
