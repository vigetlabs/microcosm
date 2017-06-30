import Action from '../../../src/action'

describe('prune', function() {
  it('does not prune non-existing grandparents', function() {
    const grandparent = new Action(n => n)
    const parent = new Action(n => n)
    const child = new Action(n => n)

    grandparent.adopt(parent)
    parent.adopt(child)

    child.prune()
    child.prune()

    expect(parent.parent).toEqual(null)
  })

  it('warns when pruning a disconnected action', function() {
    const parent = new Action(n => n)
    const child = new Action(n => n)

    parent.adopt(child)

    child.remove()

    expect(function() {
      child.prune()
    }).toThrow('Unable to prune action. It is already disconnected.')
  })
})
