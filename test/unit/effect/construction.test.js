import Microcosm from '../../../src/microcosm'

describe('Effect construction', function () {

  it('an effect may be a class', function () {
    const repo = new Microcosm()
    const test = n => n
    const spy  = jest.fn()

    class Effect {
      handler = spy

      register() {
        return {
          [test] : this.handler
        }
      }
    }

    repo.addEffect(Effect)

    repo.push(test, true)

    expect(spy).toHaveBeenCalledWith(repo, true)
  })

})
