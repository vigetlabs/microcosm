import Microcosm from '../../../src/microcosm'

describe('Effect::teardown', function () {
  it('is torn down with the repo', function () {
    const repo = new Microcosm()
    const spy = jest.fn()

    class Effect {
      teardown = spy;
    }

    repo.addEffect(Effect)

    repo.shutdown()

    expect(spy).toHaveBeenCalledWith(repo)
  })

  it('does not need to implement teardown', function () {
    const repo = new Microcosm()
    repo.addEffect(class Effect {})
    repo.shutdown()
  })
})
