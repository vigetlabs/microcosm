import Action from '../../../src/action'

describe('remove', function() {
  it('does not remove non-existent parents', function() {
    const parent = new Action(n => n)
    const child = new Action(n => n)

    parent.adopt(child)

    child.remove()

    expect(child.parent).toEqual(null)
    expect(parent.next).toEqual(null)
  })

  it('warns when removing a disconnected action', function() {
    const parent = new Action(n => n)
    const child = new Action(n => n)

    parent.adopt(child)

    child.remove()

    expect(function() {
      child.remove()
    }).toThrow('Action has already been removed.')
  })
})
