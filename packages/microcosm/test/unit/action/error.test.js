import Microcosm from 'microcosm'

const identity = n => n

describe('Action error state', function() {
  it('exposes a reject type when rejected', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.reject()

    expect(action).toHaveStatus('reject')
  })

  it('triggers a reject event when it is rejected', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const callback = jest.fn()

    action.onError(callback)
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

  it('does not trigger an reject event if it is complete', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const spy = jest.fn()

    action.onError(spy)
    action.resolve()
    action.reject()

    expect(spy).not.toHaveBeenCalled()
  })

  it.skip('aliases the reject type with error', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.reject()

    expect(action).toHaveStatus('reject')
  })
})
