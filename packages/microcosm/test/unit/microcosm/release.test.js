import Microcosm from 'microcosm'

describe('Microcosm::release', function() {
  it('will not emit a change if state is shallowly equal', function() {
    const repo = new Microcosm()
    const identity = n => n
    const spy = jest.fn()

    repo.addDomain('test', {
      getInitialState() {
        return 0
      },
      register() {
        return { [identity]: (state, next) => next }
      }
    })

    repo.answers.test.subscribe(spy)

    repo.push(identity, 0)

    expect(spy).not.toHaveBeenCalled()
  })

  it('will emit a change if state is not shallowly equal', function() {
    const repo = new Microcosm()
    const identity = n => n
    const spy = jest.fn()

    repo.addDomain('test', {
      getInitialState() {
        return 0
      },
      register() {
        return { [identity]: (_, next) => next }
      }
    })

    repo.answers.test.subscribe(spy)

    repo.push(identity, 1)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('children have the latest state when their parents change', function() {
    expect.assertions(2)

    let step = n => n
    let repo = new Microcosm({ maxHistory: Infinity })
    let fork = repo.fork()

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [step]: (a, b) => a + b }
      }
    })

    repo.answers.count.subscribe(() => {
      expect(repo.state.count).toBe(1)
      expect(fork.state.count).toBe(1)
    })

    repo.push(step, 1)
  })
})
