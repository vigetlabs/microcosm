import History from '../../../src/history'

describe('History::toArray', function () {
  const action = n => n

  it('does not walk past the head', function () {
    const history = new History()

    let one = history.append(action)

    history.append(action)
    history.append(action)
    history.checkout(one)

    history.archive()

    expect(history.toArray()).toEqual([ one ])
  })

  it('only walks through the main timeline', function () {
    const history = new History()

    const first = history.append(action)

    history.append(action)

    history.checkout(first)

    const third = history.append(action)

    history.archive()

    const ids = history.map(n => n.id)

    expect(ids).toEqual([ first.id, third.id ])
  })

})
