import Microcosm from '../src/microcosm'

describe('::shouldCommit', function () {

  it('is given initial state at the start', function () {
    const repo = new Microcosm()
    const test = jest.fn(() => false)

    class Counter {
      getInitialState() {
        return 0
      }
      get shouldCommit() {
        return test
      }

      commit (next) {
        return next
      }
    }

    repo.addDomain('count', Counter)
    repo.patch({ count: 0 })

    expect(test).toHaveBeenCalledWith(0, 0)
  })

  it('prevents commiting if returns false', function () {
    const repo = new Microcosm()
    const add  = n => n

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      shouldCommit(next, previous) {
        return Math.round(next) !== Math.round(previous)
      },
      commit (next, previous) {
        return Math.round(next)
      },
      register() {
        return {
          [add]: (a, b) => a + b
        }
      }
    })

    let first = repo.state

    return repo.push(add, 0.1).onDone(function() {
      expect(repo.state.count).toBe(first.count)
    })
  })

})

describe('::commit', function() {

  it('always writes for the first time', function() {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return true
      },
      shouldCommit(next, last) {
        return next !== last
      },
      commit (state) {
        return state
      }
    })

    expect(repo.state.test).toEqual(true)
  })

  it('always executes if shouldCommit is not implemented', function() {
    let repo = new Microcosm()
    let handler = jest.fn(state => state)

    repo.addDomain('test', {
      getInitialState() {
        return true
      },
      commit: handler
    })

    repo.patch({ test: true })

    expect(handler).toHaveBeenCalledTimes(2)
  })

})


describe('Creation modes', function () {

  it('object - primitive', function () {
    const repo = new Microcosm()

    repo.addDomain('count', {
      getInitialState() {
        return 0
      }
    })

    expect(repo.state.count).toBe(0)
  })

  it('object - original primitive is not mutated', function () {
    const repo = new Microcosm()

    const MyDomain = {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', MyDomain)

    expect(MyDomain.setup).toBeUndefined()
  })

  it('class - simple', function () {
    const repo = new Microcosm()

    class Counter {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo.state.count).toBe(0)
  })

  it('class - extends domain', function () {
    const repo = new Microcosm()

    class Counter {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo.state.count).toBe(0)
  })

})

describe('Lifecycle', function() {

  it('setup - gets called with a reference to the repo and options', function () {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter {
      get setup () {
        return test
      }
    }

    repo.addDomain('count', Counter, { test: true })

    expect(test).toHaveBeenCalledWith(repo, { test: true })
  })

  it('teardown - gets called with a reference to the repo', function () {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter {
      get teardown () {
        return test
      }
    }

    repo.addDomain('count', Counter, { test: true })

    repo.teardown()

    expect(test).toHaveBeenCalledWith(repo)
  })

})
