import Microcosm from 'microcosm'

describe('History::wait', function() {
  const action = n => n

  it('resolves when every action completes successfully', function() {
    const repo = new Microcosm()

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    setTimeout(function() {
      one.resolve()
      two.resolve()
      three.resolve()
    }, 10)

    return repo.history.wait()
  })

  it('fails when an action rejects', async function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    setTimeout(function() {
      one.resolve()
      two.resolve()
      three.reject('Wut')
    }, 10)

    try {
      await repo.history.wait()
    } catch (error) {
      expect(error).toEqual('Wut')
    }
  })

  it('ignores cancelled actions', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    setTimeout(function() {
      one.resolve()
      two.cancel()
      three.resolve('Wut')
    }, 10)

    // This will fail if the promise returned from `wait()` rejects, and
    // it will only pass when the promise resolves.
    return repo.history.wait()
  })
})
