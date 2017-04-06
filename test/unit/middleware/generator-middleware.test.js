import Microcosm from '../../../src/microcosm'

describe('Generator Middleware', function () {

  it('processes actions sequentially', function () {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    function range (start, end) {
      return function * (send) {
        let value = start

        while (value < end) {
          value = yield send(stepper, value)
        }
      }
    }

    repo.push(range, 0, 3).onDone(result => {
      expect(result).toEqual(3)
    })
  })

  it('continues if yielding a non-action value', function () {
    expect.assertions(1)

    let repo = new Microcosm()
    let step = n => n

    function test () {
      return function * (send) {
        yield send(step, 1)
        yield true
      }
    }

    repo.push(test).onDone(result => {
      expect(result).toEqual(true)
    })
  })

  it('a rejected step halts the chain', function () {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    let sequence = repo.push(function () {
      return function * (send, repo) {
        yield send(stepper, 0)
        yield repo.append(stepper).reject('Failure')
        yield send(stepper)
      }
    })

    sequence.onDone(function () {
      throw new Error('Sequence should not have completed')
    })

    sequence.onError(result => {
      expect(result).toEqual('Failure')
    })
  })

  it('a cancelled step halts the chain', function () {
    expect.assertions(1)

    let stepper = n => n + 1
    let repo = new Microcosm()

    let sequence = repo.push(function () {
      return function * (send, repo) {
        yield send(stepper, 0)
        yield repo.append(stepper).cancel('Cancelled')
        yield send(stepper)
      }
    })

    sequence.onDone(function () {
      throw new Error('Sequence should not have resolved')
    })

    sequence.onError(function () {
      throw new Error('Sequence should not have rejected')
    })

    sequence.onCancel(result => {
      expect(result).toEqual('Cancelled')
    })
  })

  it('waits for an async action to finish before moving on', function () {
    let stepper = n => n + 1
    let repo = new Microcosm()

    function sleep (time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    return repo.push(function () {
      return function * (send, repo) {
        yield send(sleep, 100)
        yield send(sleep, 100)
      }
    }).onDone(function (payload) {
      expect(payload).toEqual(true)
    })
  })

  it('waits for an async sequences', function () {
    let stepper = n => n + 1
    let repo = new Microcosm()

    function sleep (time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    function dream (time) {
      return function * (send, repo) {
        yield send(sleep, time)
        yield send(sleep, time)
      }
    }

    return repo.push(function () {
      return function * (send, repo) {
        yield send(dream, 100)
        yield send(dream, 100)
      }
    }).onDone(function (payload) {
      expect(payload).toEqual(true)
    })
  })

  it('multiple async sequence pushes do not step on eachother', function () {
    let stepper = n => n + 1
    let repo = new Microcosm()

    function sleep (time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    function dream (time) {
      return function * (send, repo) {
        yield send(sleep, time)
        yield send(sleep, time)
      }
    }

    function dream100 () {
      return function * (send, repo) {
        yield send(dream, 100)
        yield send(dream, 100)
      }
    }

    return Promise.all([ repo.push(dream100), repo.push(dream100) ])
  })

  it('history.wait() works with generators', async function () {
    let repo = new Microcosm()

    function sleep (time) {
      return action => {
        setTimeout(() => action.resolve(true), time)
      }
    }

    function dream (time) {
      return function * (send, repo) {
        yield send(sleep, time)
        yield send(sleep, time)
        yield send(sleep, time)
      }
    }

    repo.push(dream, 100)

    await repo.history.wait()
  })

})
