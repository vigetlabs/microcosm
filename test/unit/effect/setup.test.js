import Microcosm from '../../../src/microcosm'

describe('Effect::setup', function () {
  it('an effect is setup with options', function () {
    const repo = new Microcosm()
    const spy = jest.fn()

    class Effect {
      setup = spy;
    }

    repo.addEffect(Effect, { test: true })

    expect(spy).toHaveBeenCalledWith(repo, { test: true })
  })
})
