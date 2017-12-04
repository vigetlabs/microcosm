import Microcosm from 'microcosm'

describe.skip('remove', function() {
  it('does not remove non-existent parents', function() {
    const repo = new Microcosm()
    const parent = repo.append(n => n)
    const child = repo.append(n => n)

    parent.adopt(child)

    child.remove()

    expect(child.parent).toEqual(null)
    expect(parent.next).toEqual(null)
  })

  it.dev('warns when removing a disconnected action', function() {
    const repo = new Microcosm()
    const parent = repo.append(n => n)
    const child = repo.append(n => n)

    parent.adopt(child)

    child.remove()

    expect(function() {
      child.remove()
    }).toThrow('Action has already been removed.')
  })
})
