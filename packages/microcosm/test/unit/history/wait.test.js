import Microcosm from 'microcosm'

describe('History::wait', function() {
  const delay = (n) => action => setTimeout(action.complete, n)
  const reject = (n) => action => setTimeout(action.error, n)

  it('resolves when every action completes successfully', function() {
    const repo = new Microcosm()

    let one = repo.push(delay, 0)
    let two = repo.push(delay, 0)
    let three = repo.push(delay, 0)

    return repo.history.wait()
  })

  it('fails when an action rejects', async function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push(delay, 0)
    let two = repo.push(delay, 0)
    let three = repo.push(reject, 0)

    try {
      await repo.history.wait()
    } catch (error) {
      expect(error).toEqual('Wut')
    }
  })

  it.skip('ignores cancelled actions', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push(delay)
    let two = repo.push(delay)
    let three = repo.push(delay)

    // This will fail if the promise returned from `wait()` rejects, and
    // it will only pass when the promise resolves.
    return repo.history.wait()
  })
})
