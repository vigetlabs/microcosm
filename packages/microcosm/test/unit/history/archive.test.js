import { Microcosm } from 'microcosm'

const never = () => new Promise(() => {})
const noop = () => {}

describe('History::archive', function() {
  it('cleans up actions that fail', async () => {
    const repo = new Microcosm()

    repo.push('one')
    repo.push(() => Promise.reject(true))
    repo.push('two')

    try {
      await repo.history.wait()
    } catch (x) {
      expect(x).toBe(true)
    }

    // Note: We always hold on to at least the last action for
    // rollbacks
    expect(repo.history.size).toBe(1)
  })

  it('cleans up actions that cancels', async () => {
    const repo = new Microcosm()

    repo.push('one')
    let action = repo.push(() => new Promise(n => n))
    repo.push('two')

    action.cancel()

    await repo.history

    // Note: We always hold on to at least the last action for
    // rollbacks
    expect(repo.history.size).toBe(1)
  })

  it('archive moves all the way up to the head', function() {
    const repo = new Microcosm({ debug: true })

    repo.push('first', 1)
    let two = repo.push('second', 2)
    repo.push('third', 3)
    repo.history.checkout(two)

    repo.history.archive()

    expect(repo.history.root.toString()).toBe('second')

    // This is two because we checked out two earlier
    expect(repo.history.head.toString()).toBe('second')
  })

  it('builds up back-pressure', function() {
    const repo = new Microcosm({ debug: true })

    repo.push(noop) // 1
    repo.push(never) // 2
    repo.push(never) // 3

    repo.history.archive()

    // This is three because:
    // - 1 is complete, but 2 is not complete.
    // - 1 can not be archived because 2 might change, and require
    //   a rollback to the state of 1
    expect(repo.history.size).toBe(3)
  })

  it('can maintain a specific size', function() {
    const size = 3
    const repo = new Microcosm({ maxHistory: size })

    for (var i = 0; i < size * 2; i++) {
      repo.push(`action-${i}`)
    }

    repo.history.archive()

    expect(repo.history.size).toBe(size)
  })
})
