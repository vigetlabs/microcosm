import Microcosm from 'microcosm'

describe('action.payload', function() {
  it('an action can intentionally be set to undefined', function() {
    const repo = new Microcosm()
    const action = repo.append('test')

    action.open(true)
    expect(action.payload).toBe(true)

    action.resolve(undefined)
    expect(action.payload).toBe(undefined)
  })
})
