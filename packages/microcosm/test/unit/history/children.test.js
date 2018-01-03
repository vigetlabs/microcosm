import Microcosm from 'microcosm'

describe('History node children', function() {
  let action = n => n

  it('can determine children', function() {
    let repo = new Microcosm({ debug: true })

    let a = repo.push(action)
    let b = repo.push(action)

    repo.history.checkout(a)

    let c = repo.push(action)

    expect(repo.history.children(a).map(n => n.id)).toEqual([b.id, c.id])
  })

  it('does not lose children when checking out nodes on the left', function() {
    let repo = new Microcosm({ debug: true })

    repo.push(action)

    let b = repo.push(action)
    let c = repo.push(action)

    repo.history.checkout(b)

    let d = repo.push(action)

    expect(repo.history.children(b)).toEqual([c, d])
  })

  it('does not lose children when checking out nodes on the right', function() {
    let repo = new Microcosm({ debug: true })

    repo.push(action)

    let b = repo.push(action)
    let c = repo.push(action)

    repo.history.checkout(b)

    let d = repo.push(action)

    repo.history.checkout(c)

    expect(repo.history.children(b)).toEqual([c, d])
  })
})
