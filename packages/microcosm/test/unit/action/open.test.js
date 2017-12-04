import Microcosm from 'microcosm'

const identity = n => n

describe('Action open state', function() {
  it('exposes an open type when opened', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.open()

    expect(action).toHaveStatus('open')
  })

  it('triggers an open event when it opens', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const callback = jest.fn()

    action.subscribe(callback)
    action.open(3)

    expect(callback).toHaveBeenCalledWith({ status: 'open', payload: 3 })
  })

  it.skip('actions are no longer disabled when opened', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.open(true)

    expect(action.disabled).toBe(false)
    expect(action).toHaveStatus('open')
  })

  it('does not trigger an open event if it is complete', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const spy = jest.fn()

    action.onOpen(spy)
    action.resolve()
    action.open()

    expect(spy).not.toHaveBeenCalled()
  })
})
