import Microcosm from '../../../src/microcosm'

describe('History::setLimit', function() {
  it('sets the correct size given Infinity', function() {
    const repo = new Microcosm()

    repo.history.setLimit(Infinity)

    expect(repo.history.limit).toEqual(Infinity)
  })

  it('sets the correct size given an integer', function() {
    const repo = new Microcosm()

    repo.history.setLimit(10)

    expect(repo.history.limit).toEqual(10)
  })

  it('sets the limit to 1 given a negative integer', function() {
    const repo = new Microcosm()

    repo.history.setLimit(-10)

    expect(repo.history.limit).toEqual(1)
  })
})
