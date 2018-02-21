import { Microcosm, Effect } from 'microcosm'

describe('Effect::setup', function() {
  it('an effect is setup with options', function() {
    expect.assertions(2)

    let repo = new Microcosm()

    class Test extends Effect {
      setup(givenRepo, options) {
        expect(givenRepo).toBe(repo)
        expect(options).toMatchObject({ test: true })
      }
    }

    repo.addEffect(Test, { test: true })
  })
})
