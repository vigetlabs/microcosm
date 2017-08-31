import Microcosm from '../../../src/microcosm'

describe('Effect construction', function() {
  it('an effect may be a class', function() {
    const repo = new Microcosm()
    const test = n => n
    const spy = jest.fn()

    class Effect {
      handler = spy

      register() {
        return {
          [test]: this.handler
        }
      }
    }

    repo.addEffect(Effect)

    repo.push(test, true)

    expect(spy).toHaveBeenCalledWith(repo, true)
  })

  it('errors when given non-POJO options', function() {
    expect(function() {
      let repo = new Microcosm()
      repo.addEffect({}, new Microcosm())
    }).toThrow(/expected a plain object\. Instead got Microcosm/)
  })

  it('class - with defaults', function() {
    expect.assertions(1)

    const repo = new Microcosm()

    class Effect {
      static defaults = {
        start: 0
      }

      setup(repo, options) {
        expect(options.start).toBe(0)
      }
    }

    repo.addEffect(Effect)
  })

  it('class - draw from Microcosm options', function() {
    expect.assertions(1)

    const repo = new Microcosm({ debug: true })

    class Effect {
      setup(repo, options) {
        expect(options.debug).toBe(true)
      }
    }

    repo.addEffect(Effect)
  })

  it('class - with defaults override Microcosm options', function() {
    expect.assertions(1)

    const repo = new Microcosm({ debug: true })

    class Effect {
      static defaults = {
        debug: false
      }

      setup(repo, options) {
        expect(options.debug).toBe(false)
      }
    }

    repo.addEffect(Effect)
  })

  it('class - with passed options override defaults', function() {
    expect.assertions(1)

    const repo = new Microcosm({ count: 0 })

    class Effect {
      static defaults = {
        count: 1
      }

      setup(repo, options) {
        expect(options.count).toBe(2)
      }
    }

    repo.addEffect(Effect, { count: 2 })
  })
})
