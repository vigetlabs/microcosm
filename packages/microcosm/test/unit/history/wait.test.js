import Microcosm from 'microcosm'

describe('History::wait', function() {
  const delay = (time, value) => a => setTimeout(() => a.complete(value), time)
  const reject = (time, value) => a => setTimeout(() => a.error(value), time)

  it('resolves when every action completes successfully', function() {
    const repo = new Microcosm()

    repo.push(delay, 0)
    repo.push(delay, 0)
    repo.push(delay, 0)

    return repo.history.wait()
  })

  it('fails when an action rejects', async function() {
    const repo = new Microcosm({ debug: true })

    repo.push(delay, 0)
    repo.push(delay, 0)
    repo.push(reject, 0, 'error')

    try {
      await repo.history.wait()
    } catch (error) {
      expect(error).toEqual('error')
    }
  })

  it('ignores cancelled actions', function() {
    const repo = new Microcosm({ debug: true })

    repo.push(delay)
    let two = repo.push(delay)
    repo.push(delay)

    two.unsubscribe()

    // This will fail if the promise returned from `wait()` rejects, and
    // it will only pass when the promise resolves.
    return repo.history.wait()
  })
})
