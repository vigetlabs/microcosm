import Microcosm from '../../../src/microcosm'

describe('History::archive', function() {
  const action = n => n

  it('archive moves all the way up to the head', function() {
    const repo = new Microcosm()

    // One
    const one = repo.append('first')

    // Two
    const two = repo.append('second')

    // Three
    repo.append('third')

    repo.checkout(two)

    // Mark for disposal
    one.resolve()
    two.resolve()

    // Three should be ignored!
    repo.history.archive()

    expect(repo.history.size).toEqual(1)
    expect(`${repo.history.root}`).toBe('second')

    // This is two because we checked out two earlier
    expect(`${repo.history.head}`).toBe('second')
  })

  it('will not archive a node if prior nodes are not complete', function() {
    const repo = new Microcosm()

    // one
    repo.append(action)

    // two
    repo.append(action)

    // three
    repo.append(action).resolve()

    repo.history.archive()

    expect(repo.history.size).toBe(3)
  })

  it('archives all completed actions', function() {
    const repo = new Microcosm()

    const one = repo.append(action)
    const two = repo.append(action)

    // three
    repo.append(action)

    two.resolve()
    one.resolve()

    repo.history.archive()

    // 1 because we have an unresolved action remaining
    expect(repo.history.size).toBe(1)
  })

  it('archived nodes have no relations', function() {
    const repo = new Microcosm()

    repo.append('one').resolve()

    repo.append('two')

    repo.history.archive()

    expect(repo.history.root.parent.parent).toBe(null)
  })

  it('archiving the entire tree clears cursors', function() {
    const repo = new Microcosm()

    // one
    repo.append(action).resolve()
    // two
    const two = repo.append(action).resolve()

    repo.history.archive()

    // We always hold on to the head so that we have something to work with
    expect(repo.history.root).toBe(two)
    expect(repo.history.head).toBe(two)
  })

  it('adjusts the root node', function() {
    const repo = new Microcosm()

    const a = repo.append(action)

    repo.append(action)
    repo.append(action)

    repo.history.archive()

    expect(repo.history.root).toEqual(a)
  })
})
