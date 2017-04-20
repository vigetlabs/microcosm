import History from '../../../src/history'

describe('History::wait', function() {
  const action = n => n

  it('resolves when every action completes successfully', function() {
    const history = new History()

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)

    setTimeout(function() {
      one.resolve()
      two.resolve()
      three.resolve()
    }, 10)

    return history.wait()
  })

  it('fails when an action rejects', async function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)

    setTimeout(function() {
      one.resolve()
      two.resolve()
      three.reject('Wut')
    }, 10)

    try {
      await history.wait()
    } catch (error) {
      expect(error).toEqual('Wut')
    }
  })

  it('ignores cancelled actions', function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)

    setTimeout(function() {
      one.resolve()
      two.cancel()
      three.resolve('Wut')
    }, 10)

    // This will fail if the promise returned from `wait()` rejects, and
    // it will only pass when the promise resolves.
    return history.wait()
  })
})
