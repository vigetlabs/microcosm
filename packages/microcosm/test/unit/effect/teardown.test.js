import { Microcosm, Effect, scheduler } from 'microcosm'

describe('Effect::teardown', function() {
  it('is invoked with a reference to the repo and options', async function() {
    expect.assertions(2)

    let repo = new Microcosm()

    class Test extends Effect {
      teardown(givenRepo, options) {
        expect(givenRepo).toBe(repo)
        expect(options).toMatchObject({ test: true })
      }
    }

    repo.addEffect(Test, { test: true })
    repo.complete()

    await scheduler()
  })
})
