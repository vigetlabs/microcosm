import Microcosm from 'microcosm'

const never = () => new Promise(() => {})
const noop = () => {}

describe('History::archive', function() {
  it('archive moves all the way up to the head', function() {
    const repo = new Microcosm({ debug: true })

    let one = repo.push('first', 1)
    let two = repo.push('second', 2)
    let three = repo.push('third', 3)

    repo.history.checkout(two)
    repo.history.archive()

    expect(repo.history._root.tag).toBe('second')

    // This is two because we checked out two earlier
    expect(repo.history._head.tag).toBe('second')
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
})
