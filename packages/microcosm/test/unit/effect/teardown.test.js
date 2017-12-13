import Microcosm from 'microcosm'

describe('Effect::teardown', function() {
  it('is torn down with the repo', function() {
    const repo = new Microcosm()
    const spy = jest.fn()

    class Effect {
      teardown = spy
    }

    repo.addEffect(Effect)

    repo.complete()

    expect(spy).toHaveBeenCalledWith(repo, repo.options)
  })

  it('does not need to implement teardown', function() {
    const repo = new Microcosm()
    repo.addEffect(class Effect {})
    repo.complete()
  })
})
