import Microcosm from 'microcosm'

const identity = n => n

describe('Action complete state', function() {
  it('will not change states if already complete', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.cancel()
    action.resolve()

    expect(action.is('cancelled')).toBe(true)
    expect(action.is('done')).toBe(false)
  })
})
