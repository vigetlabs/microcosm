import History from '../../../src/history'

describe('History::archive', function() {
  const action = n => n

  it('archive moves all the way up to the head', function() {
    const history = new History()

    // One
    const one = history.append('first')

    // Two
    const two = history.append('second')

    // Three
    history.append('third')

    history.checkout(two)

    // Mark for disposal
    one.resolve()
    two.resolve()

    // Three should be ignored!
    history.archive()

    expect(history.size).toEqual(1)
    expect(history.root).toBe(two)
    // This is two because we checked out two early
    expect(history.head).toBe(two)
  })

  it('will not archive a node if prior nodes are not complete', function() {
    const history = new History()

    // one
    history.append(action)

    // two
    history.append(action)

    // three
    history.append(action).resolve()

    history.archive()

    expect(history.size).toBe(3)
  })

  it('archives all completed actions', function() {
    const history = new History()

    const one = history.append(action)
    const two = history.append(action)

    // three
    history.append(action)

    two.resolve()
    one.resolve()

    history.archive()

    // 1 because we have an unresolved action remaining
    expect(history.size).toBe(1)
  })

  it('archived nodes have no relations', function() {
    const history = new History()

    history.append(action).resolve()

    history.append(action)

    history.archive()

    expect(history.root.parent.parent).toBe(null)
  })

  it('archiving the entire tree clears cursors', function() {
    const history = new History()

    // one
    history.append(action).resolve()
    // two
    const two = history.append(action).resolve()

    history.archive()

    // We always hold on to the head so that we have something to work with
    expect(history.root).toBe(two)
    expect(history.head).toBe(two)
  })

  it('adjusts the root node', function() {
    const history = new History()

    const a = history.append(action)

    history.append(action)
    history.append(action)

    history.archive()

    expect(history.root).toEqual(a)
  })
})
