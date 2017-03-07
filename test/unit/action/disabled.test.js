import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action disabled state', function () {

  it('preserves other states when disabled', function () {
    const action = new Action(identity)

    action.resolve()
    action.toggle()

    expect(action).toHaveStatus('done')
  })

  it('is toggleable', function () {
    const action = new Action(identity)

    action.resolve()
    expect(action.disabled).toBe(false)

    action.toggle()
    expect(action.disabled).toBe(true)
  })

  it('can toggle history without triggering a reconciliation', function () {
    const action = new Action(identity)

    jest.spyOn(action.history, 'reconcile')

    action.toggle('silently')

    expect(action.history.reconcile).not.toHaveBeenCalled()
  })

})
