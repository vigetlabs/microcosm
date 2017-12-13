import Microcosm from 'microcosm'

describe('Generator Middleware', function() {
  it('processes actions sequentially', async () => {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    function range(start, end) {
      return function*(repo) {
        let value = start

        while (value < end) {
          value = yield repo.push(stepper, value)
        }
      }
    }

    let result = await repo.push(range, 0, 3)

    expect(result).toEqual(3)
  })

  it('can yield non-action values', async () => {
    expect.assertions(1)

    let repo = new Microcosm()
    let step = n => n

    function test() {
      return function*(repo) {
        yield repo.push(step, 1)
        yield true
      }
    }

    let result = await repo.push(test)

    expect(result).toBe(true)
  })

  it('a rejected step halts the chain', async () => {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    let sequence = repo.push(function() {
      return function*(repo) {
        yield repo.push(stepper, 0)
        yield repo.push(() => Promise.reject('failure'))
        yield repo.push(stepper)
      }
    })

    sequence.subscribe({
      complete() {
        throw new Error('Sequence should not have completed')
      },
      error: result => {
        expect(result).toEqual('failure')
      }
    })

    await sequence
  })

  it.skip('a cancelled step halts the chain', () => {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    let sequence = repo.push(function() {
      return function*(repo) {
        yield repo.push(stepper, 0)
        yield repo.append(stepper).cancel('Cancelled')
        yield repo.push(stepper)
      }
    })

    sequence.subscribe({
      complete() {
        throw new Error('Sequence should not have resolved')
      },
      error() {
        throw new Error('Sequence should not have rejected')
      },
      cancel() {
        expect(result).toEqual('Cancelled')
      }
    })
  })

  it('waits for an async action to finish before moving on', async () => {
    let repo = new Microcosm()

    function sleep(time) {
      return new Promise(resolve => setTimeout(() => resolve(true), time))
    }

    let payload = await repo.push(function() {
      return function*(repo) {
        yield repo.push(sleep, 1)
        yield repo.push(sleep, 1)
      }
    })

    expect(payload).toEqual(true)
  })

  it('waits for an async sequences', async function() {
    let repo = new Microcosm()

    function sleep(time) {
      return action => {
        setTimeout(() => action.complete(true), time)
      }
    }

    function dream(time) {
      return function*(repo) {
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
      }
    }

    let result = await repo.push(function() {
      return function*(repo) {
        yield repo.push(dream, 1)
        yield repo.push(dream, 1)
      }
    })

    expect(result).toEqual(true)
  })

  it('multiple async sequence pushes do not step on eachother', async () => {
    let repo = new Microcosm()

    function sleep(time) {
      return action => setTimeout(action.complete, time)
    }

    function dream(time) {
      return function*(repo) {
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
      }
    }

    function dream10() {
      return function*(repo) {
        yield repo.push(dream, 1)
        yield repo.push(dream, 1)
      }
    }

    await Promise.all([repo.push(dream10), repo.push(dream10)])
  })

  it('history.wait() works with generators', async () => {
    let repo = new Microcosm()

    function sleep(time) {
      return action => setTimeout(action.complete, time)
    }

    function dream(time) {
      return function*(repo) {
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
      }
    }

    repo.push(dream, 1)

    await repo.history.wait()
  })

  it('waits for the return value to complete', async () => {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    function testReturnValue() {
      return function*(repo) {
        yield repo.push(stepper, 1)

        return repo.push(stepper, 2)
      }
    }

    let result = await repo.push(testReturnValue)

    expect(result).toEqual(2)
  })

  describe('when yielding an array', function() {
    it('waits for all items to complete', async function() {
      expect.assertions(1)

      let add = n => n
      let repo = new Microcosm()

      repo.addDomain('count', {
        getInitialState() {
          return 0
        },
        register() {
          return {
            [add]: (a, b) => a + b
          }
        }
      })

      function testReturnValue() {
        return function*(repo) {
          yield [repo.push(add, 1), repo.push(add, 1)]
        }
      }

      await repo.push(testReturnValue)

      expect(repo).toHaveState('count', 2)
    })
  })

  describe('when yielding an object', function() {
    it('waits for all items to complete', function() {
      expect.assertions(2)

      let add = n => n
      let repo = new Microcosm()

      repo.addDomain('count', {
        getInitialState() {
          return 0
        },
        register() {
          return {
            [add]: (a, b) => a + b
          }
        }
      })

      function testReturnValue() {
        return function*(repo) {
          yield { one: repo.push(add, 1), two: repo.push(add, 2) }
        }
      }

      repo.push(testReturnValue).onDone(payload => {
        expect(repo).toHaveState('count', 3)

        expect(payload).toEqual({ one: 1, two: 2 })
      })
    })
  })
})
