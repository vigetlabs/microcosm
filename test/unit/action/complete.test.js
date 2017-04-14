import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action complete state', function () {

  it('actions are complete when they resolve', function () {
    const action = new Action(identity)

    action.resolve(true)

    expect(action.complete).toBe(true)
  })

  it('actions are complete when they cancel', function () {
    const action = new Action(identity)

    action.cancel(true)

    expect(action.complete).toBe(true)
  })

  it('actions are complete when they fail', function () {
    const action = new Action(identity)

    action.reject(true)

    expect(action.complete).toBe(true)
  })

  it('will not change states if already complete', function () {
    const action = new Action(identity)
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    action.cancel()
    action.resolve()

    expect(spy).toHaveBeenCalledWith('Action "identity" is already in the cancel state. Calling resolve() will not change it.')

    expect(action.is('cancelled')).toBe(true)
    expect(action.is('done')).toBe(false)

    spy.mockRestore()
  })

})
