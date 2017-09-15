import Microcosm from 'microcosm'

describe('prune', function() {
  it('does not prune non-existing grandparents', function() {
    const repo = new Microcosm()
    const grandparent = repo.append(n => n)
    const parent = repo.append(n => n)
    const child = repo.append(n => n)

    grandparent.adopt(parent)
    parent.adopt(child)

    child.prune()
    child.prune()

    expect(parent.parent).toEqual(null)
  })

  it.dev('warns when pruning a disconnected action', function() {
    const repo = new Microcosm()
    const parent = repo.append(n => n)
    const child = repo.append(n => n)

    parent.adopt(child)

    child.remove()

    expect(function() {
      child.prune()
    }).toThrow('Unable to prune action. It is already disconnected.')
  })
})
