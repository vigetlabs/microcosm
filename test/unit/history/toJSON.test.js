import Microcosm from '../../../src/microcosm'

describe('History::toJSON', function() {
  const action = n => n

  it('includes the size of the tree', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.push(action)
    repo.push(action)

    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.size).toEqual(3)
  })

  it('includes an id reference to the head', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.push(action)

    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.head).toEqual(repo.history.head.id)
  })

  it('includes an id reference to the root', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.push(action)

    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.root).toEqual(repo.history.root.id)
  })

  it('serializes the tree of actions', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let head = repo.push(action, true)
    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.head).toEqual(head.id)
    expect(json.root).toEqual(head.parent.id)
    expect(json.size).toEqual(2)
  })
})
