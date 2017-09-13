import Microcosm from '../../src/microcosm'

describe('Reconciliation', function() {
  const action = n => n

  it('only interates over the point of reconciliation', function() {
    const repo = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn((a, b) => a + b)

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: handler }
      }
    })

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    expect(repo).toHaveState('count', 0)

    one.resolve(1)
    expect(repo).toHaveState('count', 1)

    two.resolve(2)
    expect(repo).toHaveState('count', 3)

    three.resolve(3)
    expect(repo).toHaveState('count', 6)

    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('reapplies future actions if a prior action updates', function() {
    const repo = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn((a, b) => a + b)

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: handler }
      }
    })

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    expect(repo).toHaveState('count', 0)

    three.resolve(3)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(repo).toHaveState('count', 3)

    two.resolve(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(repo).toHaveState('count', 5)

    one.resolve(1)
    expect(handler).toHaveBeenCalledTimes(6)
    expect(repo).toHaveState('count', 6)
  })

  it.dev('archived actions are removed from the archive', function() {
    const repo = new Microcosm()

    let one = repo.append('one')
    let two = repo.append('two')
    let three = repo.append('three')

    three.resolve()
    two.resolve()
    one.resolve()

    // Recalling one will find nothing, so the repo returns initial state
    expect(repo._recall(one)).toEqual(repo.getInitialState())

    // Two is in here because it is the parent of three, which we need as a "base state"
    expect(repo._recall(two)).toBeDefined()
    expect(repo._recall(three)).toBeDefined()
  })

  it('pushing actions while the root is "open" does not result in extra invocations', function() {
    const repo = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn((a, b) => a + b)

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: handler }
      }
    })

    repo.append(action)
    repo.append(action).resolve(1)
    repo.append(action).resolve(2)
    repo.append(action).resolve(3)

    expect(repo).toHaveState('count', 6)
    expect(handler).toHaveBeenCalledTimes(3)
  })
})
