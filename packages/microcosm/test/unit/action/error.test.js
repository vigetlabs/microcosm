import Microcosm from 'microcosm'

const identity = n => n

describe('Action error state', function() {
  it('exposes a error type when rejected', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.reject()

    expect(action).toHaveStatus('error')
  })

  it('triggers a error event when it is rejected', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const callback = jest.fn()

    action.once('reject', callback)
    action.reject(404)

    expect(callback).toHaveBeenCalledWith(404)
  })

  it('listens to failures', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const fn = jest.fn()

    action.onError(fn)
    action.reject(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('immediately invokes onError if the action already failed', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const fn = jest.fn()

    action.reject(true)
    action.onError(fn)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('does not trigger an error event if it is complete', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const spy = jest.fn()

    action.on('error', spy)
    action.resolve()
    action.reject()

    expect(spy).not.toHaveBeenCalled()
  })

  it('aliases the done type with reject', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.reject()

    expect(action).toHaveStatus('error')
  })
})
