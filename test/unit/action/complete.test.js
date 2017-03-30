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

  it('will not change states if already disposed', function () {
    const action = new Action(identity)

    action.cancel()
    action.resolve()

    expect(action.is('cancelled')).toBe(true)
    expect(action.is('done')).toBe(false)
  })

})
