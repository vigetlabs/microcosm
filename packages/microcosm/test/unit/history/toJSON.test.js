import Microcosm from 'microcosm'

describe('History::toJSON', function() {
  const action = n => n

  it('includes the size of the tree', function() {
    const repo = new Microcosm({ debug: true })

    repo.push(action)
    repo.push(action)

    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.size).toEqual(2)
  })

  it('includes an id reference to the head', function() {
    const repo = new Microcosm({ debug: true })

    repo.push(action)

    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.head).toEqual(repo.history.head.id)
  })

  it('includes an id reference to the root', function() {
    const repo = new Microcosm({ debug: true })

    repo.push(action)

    let json = JSON.parse(JSON.stringify(repo.history))

    expect(json.root).toEqual(repo.history.root.id)
  })

  it('serializes the tree of actions', function() {
    const repo = new Microcosm({ debug: true })

    repo.push('one', true)
    let two = repo.push('two', true)
    repo.push('three', true)
    repo.history.checkout(two)
    repo.push('four', true)

    expect(repo.history).toMatchSnapshot()
  })
})
