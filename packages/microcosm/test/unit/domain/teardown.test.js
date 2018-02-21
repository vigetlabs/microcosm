import { Microcosm, Domain } from 'microcosm'

describe('Domain::teardown', function() {
  it('is invoked with a reference to the repo and options', function() {
    expect.assertions(2)

    let repo = new Microcosm()

    class Counter extends Domain {
      teardown(givenRepo, options) {
        expect(givenRepo).toBe(repo)
        expect(options).toMatchObject({ key: 'count', test: true })
      }
    }

    repo.addDomain('count', Counter, { test: true })
    repo.complete()
  })
})
