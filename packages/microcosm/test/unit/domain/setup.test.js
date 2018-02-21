import { Microcosm, Domain } from 'microcosm'

describe('Domain::setup', function() {
  it('is invoked with a reference to the repo and options', function() {
    expect.assertions(2)
    let repo = new Microcosm()

    class Counter extends Domain {
      setup(givenRepo, options) {
        expect(givenRepo).toBe(repo)
        expect(options).toMatchObject({ test: true })
      }
    }

    repo.addDomain('count', Counter, { test: true })
  })
})
