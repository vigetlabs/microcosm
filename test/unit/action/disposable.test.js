import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action disposable state', function () {

  it('actions are disposable when they resolve', function () {
    const action = new Action(identity)

    action.resolve(true)

    expect(action.disposable).toBe(true)
  })

  it('actions are disposable when they cancel', function () {
    const action = new Action(identity)

    action.cancel(true)

    expect(action.disposable).toBe(true)
  })

  it('actions are disposable when they fail', function () {
    const action = new Action(identity)

    action.reject(true)

    expect(action.disposable).toBe(true)
  })

  it('will not change states if already disposed', function () {
    const action = new Action(identity)

    action.cancel()
    action.resolve()

    expect(action.is('cancelled')).toBe(true)
    expect(action.is('done')).toBe(false)
  })

})
