import Microcosm from '../../../src/microcosm'

describe('Domain::teardown', function() {
  it('is invoked with a reference to the repo', function() {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter {
      get teardown() {
        return test
      }
    }

    repo.addDomain('count', Counter, { test: true })

    repo.shutdown()

    expect(test).toHaveBeenCalledWith(repo)
  })
})
