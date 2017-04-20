import History from '../../../src/history'

describe('History node children', function() {
  const action = n => n

  it('can determine children', function() {
    const history = new History()
    const a = history.append(action)
    const b = history.append(action)

    history.checkout(a)

    const c = history.append(action)

    expect(a.children.map(n => n.id)).toEqual([b.id, c.id])
  })

  it('does not lose children when checking out nodes on the left', function() {
    const history = new History()

    history.append(action)

    const b = history.append(action)
    const c = history.append(action)

    history.checkout(b)

    const d = history.append(action)

    expect(b.children).toEqual([c, d])
  })

  it('does not lose children when checking out nodes on the right', function() {
    const history = new History()

    history.append(action)

    const b = history.append(action)
    const c = history.append(action)

    history.checkout(b)

    const d = history.append(action)

    history.checkout(c)

    expect(b.children).toEqual([c, d])
  })
})
