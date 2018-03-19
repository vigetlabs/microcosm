import { Microcosm } from 'microcosm'

describe('Microcosm::release', function() {
  it('will not emit a change if state is shallowly equal', function() {
    const repo = new Microcosm()
    const identity = n => n
    const spy = jest.fn()

    const test = repo.addDomain('test', {
      getInitialState() {
        return 0
      },
      register() {
        return { [identity]: (state, next) => next }
      }
    })

    test.subscribe(spy)

    expect(spy).toHaveBeenCalledTimes(1)
    repo.push(identity, 0)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('will emit a change if state is not shallowly equal', function() {
    const repo = new Microcosm()
    const identity = n => n
    const spy = jest.fn()

    const test = repo.addDomain('test', {
      getInitialState() {
        return 0
      },
      register() {
        return { [identity]: (_, next) => next }
      }
    })

    test.subscribe(spy)

    expect(spy).toHaveBeenCalledTimes(1)
    repo.push(identity, 1)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('children have the latest state when their parents change', function() {
    expect.assertions(2)

    let step = n => n
    let repo = new Microcosm({ debug: true })
    let fork = repo.fork()

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [step]: (a, b) => a + b }
      }
    })

    // This will fire twice:
    fork.domains.count.subscribe(() => {
      expect(fork.state).toEqual(repo.state)
    })

    repo.push(step, 1)
  })
})
