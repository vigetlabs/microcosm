import Microcosm from '../src/microcosm'

describe('Creation modes', function () {

  it('object - primitive', function () {
    const repo = new Microcosm()

    repo.addDomain('count', {
      getInitialState() {
        return 0
      }
    })

    expect(repo).toHaveState('count', 0)
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

    expect(repo).toHaveState('count', 0)
  })

  it('class - extends domain', function () {
    const repo = new Microcosm()

    class Counter {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo).toHaveState('count', 0)
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
