import Microcosm from 'microcosm'

describe('Domain::register', function() {
  it('sends actions in the context of the domain', function() {
    expect.assertions(1)

    let repo = new Microcosm()

    repo.addDomain('test', {
      test: true,
      register() {
        return {
          action() {
            expect(this.test).toBe(true)
          }
        }
      }
    })

    repo.push('action', true)
  })

  it('gets initial state', function() {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => 0
    })

    expect(repo.state.test).toBe(0)
  })

  it('counts', function() {
    let repo = new Microcosm({ debug: true })

    repo.addDomain('test', {
      getInitialState: () => 0,
      register() {
        return {
          add: (a, b) => {
            return a + b
          }
        }
      }
    })

    repo.push('add', 1)
    repo.push('add', 1)

    expect(repo.state.test).toBe(2)
  })

  it('returns the same state if a handler is not provided', async () => {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return 'test'
      }
    })

    await repo.push('test')

    expect(repo.state.test).toBe('test')
  })

  it('should have state before an action resolves', async () => {
    expect.assertions(2)

    let repo = new Microcosm()
    let action = n => Promise.resolve(n)

    repo.addDomain('test', {
      getInitialState() {
        return 'start'
      },
      register() {
        return {
          [action]: {
            next: (a, b) => `next: ${b}`,
            complete: (a, b) => `complete: ${b}`
          }
        }
      }
    })

    let job = repo.push(action, 2)

    job.subscribe({
      next() {
        expect(repo.domains.test.payload).toBe('next: 2')
      },
      complete() {
        expect(repo.domains.test.payload).toBe('complete: 2')
      }
    })

    await job
  })

  it('remembers the execution order', function() {
    let repo = new Microcosm({ debug: true })
    let add = () => action => {}

    repo.addDomain('test', {
      getInitialState: () => 0,
      register() {
        return {
          [add]: (a, b) => {
            return a + b
          }
        }
      }
    })

    let one = repo.push(add)
    let two = repo.push(add)

    two.complete(1)
    one.complete(1)

    expect(repo.state.test).toBe(2)
  })
})
