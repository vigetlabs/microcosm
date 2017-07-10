import History from '../../../src/history'

describe('History::toJSON', function() {
  const action = n => n

  it('includes the size of the tree', function() {
    const history = new History({ maxHistory: Infinity })

    history.append(action).resolve()
    history.append(action).resolve()

    let json = JSON.parse(JSON.stringify(history))

    expect(json.size).toEqual(3)
  })

  it('includes an id reference to the head', function() {
    const history = new History({ maxHistory: Infinity })

    history.append(action).resolve()

    let json = JSON.parse(JSON.stringify(history))

    expect(json.head).toEqual(history.head.id)
  })

  it('includes an id reference to the root', function() {
    const history = new History({ maxHistory: Infinity })

    history.append(action).resolve()

    let json = JSON.parse(JSON.stringify(history))

    expect(json.root).toEqual(history.root.id)
  })

  it('serializes the tree of actions', function() {
    const history = new History({ maxHistory: Infinity })

    let head = history.append(action).resolve(true)
    let json = JSON.parse(JSON.stringify(history))

    expect(json.head).toEqual(head.id)
    expect(json.root).toEqual(head.parent.id)
    expect(json.size).toEqual(2)
  })
})
