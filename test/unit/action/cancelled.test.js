import Action from '../../../src/action'

const identity = n => n

describe('Action cancelled state', function() {
  it('triggers a cancel event when it is cancelled', function() {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('cancel', callback)
    action.cancel()

    expect(callback).toHaveBeenCalled()
  })

  it('becomes complete when cancelled', function() {
    const action = new Action(identity)

    action.cancel()

    expect(action.complete).toBe(true)
  })

  it('exposes a cancelled type when cancelled', function() {
    const action = new Action(identity)

    action.cancel()

    expect(action).toHaveStatus('cancel')
  })

  it('onCancel is a one time binding', function() {
    const action = new Action(identity)
    const callback = jest.fn()

    action.onCancel(callback)

    action.cancel()

    action._emit('cancel')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('executes onCancel if the action is already cancelled', function() {
    const action = new Action(identity)
    const callback = jest.fn()

    action.cancel()
    action.onCancel(callback)

    expect(callback).toHaveBeenCalled()
  })

  it('aliases the cancelled type with cancel', function() {
    const action = new Action(identity)

    action.cancel()

    expect(action).toHaveStatus('cancel')
  })
})
