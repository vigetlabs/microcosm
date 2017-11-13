import Microcosm from 'microcosm'

describe('Generator Middleware', function() {
  it('processes actions sequentially', function() {
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

    repo.push(range, 0, 3).onDone(result => {
      expect(result).toEqual(3)
    })
  })

  it.dev('throws if yielding a non-action value', function() {
    expect.assertions(1)

    let repo = new Microcosm()
    let step = n => n

    function test() {
      return function*(repo) {
        yield repo.push(step, 1)
        yield true
      }
    }

    expect(() => repo.push(test)).toThrow(
      'Iteration of generator expected an Action'
    )
  })

  it('a rejected step halts the chain', function() {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    let sequence = repo.push(function() {
      return function*(repo) {
        yield repo.push(stepper, 0)
        yield repo.append(stepper).reject('Failure')
        yield repo.push(stepper)
      }
    })

    sequence.onDone(function() {
      throw new Error('Sequence should not have completed')
    })

    sequence.onError(result => {
      expect(result).toEqual('Failure')
    })
  })

  it('a cancelled step halts the chain', function() {
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

    sequence.onDone(function() {
      throw new Error('Sequence should not have resolved')
    })

    sequence.onError(function() {
      throw new Error('Sequence should not have rejected')
    })

    sequence.onCancel(result => {
      expect(result).toEqual('Cancelled')
    })
  })

  it('waits for an async action to finish before moving on', function() {
    let repo = new Microcosm()

    function sleep(time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    return repo
      .push(function() {
        return function*(repo) {
          yield repo.push(sleep, 100)
          yield repo.push(sleep, 100)
        }
      })
      .onDone(function(payload) {
        expect(payload).toEqual(true)
      })
  })

  it('waits for an async sequences', function() {
    let repo = new Microcosm()

    function sleep(time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    function dream(time) {
      return function*(repo) {
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
      }
    }

    return repo
      .push(function() {
        return function*(repo) {
          yield repo.push(dream, 100)
          yield repo.push(dream, 100)
        }
      })
      .onDone(function(payload) {
        expect(payload).toEqual(true)
      })
  })

  it('multiple async sequence pushes do not step on eachother', function() {
    let repo = new Microcosm()

    function sleep(time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    function dream(time) {
      return function*(repo) {
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
      }
    }

    function dream100() {
      return function*(repo) {
        yield repo.push(dream, 100)
        yield repo.push(dream, 100)
      }
    }

    return Promise.all([repo.push(dream100), repo.push(dream100)])
  })

  it('history.wait() works with generators', async function() {
    let repo = new Microcosm()

    function sleep(time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    function dream(time) {
      return function*(repo) {
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
        yield repo.push(sleep, time)
      }
    }

    repo.push(dream, 100)

    await repo.history.wait()
  })

  it('waits for the return value to complete', function() {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    function testReturnValue() {
      return function*(repo) {
        yield repo.push(stepper, 1)

        return repo.push(stepper, 2)
      }
    }

    repo.push(testReturnValue).onDone(result => {
      expect(result).toEqual(2)
    })
  })

  describe('when yielding an array', function() {
    it('waits for all items to complete', function() {
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

      repo.push(testReturnValue).onDone(() => {
        expect(repo).toHaveState('count', 2)
      })
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
