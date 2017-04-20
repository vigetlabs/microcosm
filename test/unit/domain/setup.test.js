import Microcosm from '../../../src/microcosm'

describe('Domain::setup', function() {
  it('is invoked with a reference to the repo and options', function() {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter {
      get setup() {
        return test
      }
    }

    repo.addDomain('count', Counter, { test: true })

    expect(test).toHaveBeenCalledWith(repo, { test: true })
  })
})
