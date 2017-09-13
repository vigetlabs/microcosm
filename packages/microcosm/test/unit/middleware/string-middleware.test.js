import Microcosm from '../../../src/microcosm'

describe('String middleware', function() {
  it('passes strings through as identify functions', function() {
    let repo = new Microcosm()
    let action = repo.push('test', true)

    expect(action.type).toBe('test')
    expect(action.payload).toBe(true)
  })
})
