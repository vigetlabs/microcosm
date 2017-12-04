import Microcosm from 'microcosm'

const identity = n => n

describe('Action cancelled state', function() {
  it('triggers a cancel event when it is cancelled', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const callback = jest.fn()

    action.onCancel(callback)
    action.cancel(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('becomes closed when cancelled', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.cancel()

    expect(action.closed).toBe(true)
  })

  it('exposes a cancelled type when cancelled', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.cancel()

    expect(action).toHaveStatus('cancel')
  })

  it.dev('onCancel is a one time binding', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const callback = jest.fn()

    action.onCancel(callback)

    action.cancel()
    action.cancel()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('executes onCancel if the action is already cancelled', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const callback = jest.fn()

    action.cancel()
    action.onCancel(callback)

    expect(callback).toHaveBeenCalled()
  })

  it('aliases the cancelled type with cancel', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.cancel()

    expect(action).toHaveStatus('cancel')
  })
})
