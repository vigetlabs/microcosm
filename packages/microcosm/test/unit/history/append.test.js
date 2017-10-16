import Microcosm from 'microcosm'

describe('History::append', function() {
  const action = n => n

  it('adjusts the focal point when adding a node', function() {
    const repo = new Microcosm()

    repo.append(action)
    repo.append(action)

    expect(repo.history.head.command).toEqual(action)
  })

  it('can get the previous node in the chain', function() {
    const repo = new Microcosm()

    const one = repo.append(action)
    const two = repo.append(action)
    const three = repo.append(action)

    expect(two.parent).toEqual(one)
    expect(three.parent).toEqual(two)
  })
})
