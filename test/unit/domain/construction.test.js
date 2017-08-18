import Microcosm from '../../../src/microcosm'

describe('Domain construction', function() {
  it('object - primitive', function() {
    const repo = new Microcosm()

    repo.addDomain('count', {
      getInitialState() {
        return 0
      }
    })

    expect(repo).toHaveState('count', 0)
  })

  it('object - original primitive is not mutated', function() {
    const repo = new Microcosm()

    const MyDomain = {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', MyDomain)

    expect(MyDomain.setup).toBeUndefined()
  })

  it('class - simple', function() {
    const repo = new Microcosm()

    class Counter {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo).toHaveState('count', 0)
  })

  it('class - with defaults', function() {
    expect.assertions(1)

    const repo = new Microcosm()

    class Counter {
      static defaults = {
        start: 0
      }

      setup(repo, options) {
        expect(options.start).toBe(0)
      }
    }

    repo.addDomain('count', Counter)
  })

  it('class - draw from Microcosm options', function() {
    expect.assertions(1)

    const repo = new Microcosm({ debug: true })

    class Counter {
      setup(repo, options) {
        expect(options.debug).toBe(true)
      }
    }

    repo.addDomain('count', Counter)
  })

  it('class - with defaults override Microcosm options', function() {
    expect.assertions(1)

    const repo = new Microcosm({ debug: true })

    class Counter {
      static defaults = {
        debug: false
      }

      setup(repo, options) {
        expect(options.debug).toBe(false)
      }
    }

    repo.addDomain('count', Counter)
  })

  it('class - with passed options override defaults', function() {
    expect.assertions(1)

    const repo = new Microcosm({ count: 0 })

    class Counter {
      static defaults = {
        count: 1
      }

      setup(repo, options) {
        expect(options.count).toBe(2)
      }
    }

    repo.addDomain('count', Counter, { count: 2 })
  })

  it('passes the mount key to options', function() {
    expect.assertions(1)

    const repo = new Microcosm({ count: 0 })

    class Counter {
      static defaults = {
        count: 1
      }

      setup(repo, options) {
        expect(options.key).toBe('count')
      }
    }

    repo.addDomain('count', Counter, { count: 2 })
  })
})
