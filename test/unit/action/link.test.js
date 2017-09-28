import Microcosm from '../../../src/microcosm'

describe('Action link', function() {
  it('remembers and returns the results of each child action', function() {
    const repo = new Microcosm()

    const action = repo.parallel([
      repo.push(() => 1),
      repo.push(() => 2),
      repo.push(() => 3)
    ])

    expect(action.payload).toEqual([1, 2, 3])
  })
})
