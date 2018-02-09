import Microcosm from 'microcosm'

describe('Reconciliation', function() {
  it('only iterates over the point of reconciliation', function() {
    const repo = new Microcosm({ debug: true })
    const handler = jest.fn((a, b) => a + b)
    const action = () => action => {}

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: handler }
      }
    })

    let one = repo.push(action)
    let two = repo.push(action)
    let three = repo.push(action)

    expect(repo).toHaveState('count', 0)

    one.next(1)
    one.complete()

    expect(repo).toHaveState('count', 1)

    two.next(2)
    two.complete()
    expect(repo).toHaveState('count', 3)

    three.next(3)
    three.complete()
    expect(repo).toHaveState('count', 6)

    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('reapplies future actions if a prior action updates', function() {
    const repo = new Microcosm({ debug: true })
    const handler = jest.fn((a, b) => a + b)
    const action = () => action => {}

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: handler }
      }
    })

    let one = repo.push(action)
    let two = repo.push(action)
    let three = repo.push(action)

    expect(repo).toHaveState('count', 0)

    three.complete(3)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(repo).toHaveState('count', 3)

    two.complete(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(repo).toHaveState('count', 5)

    one.complete(1)
    expect(handler).toHaveBeenCalledTimes(6)
    expect(repo).toHaveState('count', 6)
  })

  it('pushing actions while the root is "open" does not result in extra invocations', function() {
    const repo = new Microcosm({ debug: true })
    const handler = jest.fn((a, b) => a + b)
    const action = (payload, close) => action => {
      if (close) {
        action.next(payload)
        action.complete()
      }
    }

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: handler }
      }
    })

    repo.push(action, false)
    repo.push(action, 1, true)
    repo.push(action, 2, true)
    repo.push(action, 3, true)

    expect(repo).toHaveState('count', 6)
    expect(handler).toHaveBeenCalledTimes(3)
  })
})
