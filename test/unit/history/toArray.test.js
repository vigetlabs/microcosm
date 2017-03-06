import History from '../../../src/history'

describe('History::toArray', function () {
  const action = n => n

  it('does not walk past the focal point', function () {
    const history = new History()

    let one = history.append(action)
    history.append(action)
    history.append(action)
    history.checkout(one)

    expect(history.toArray()).toEqual([ one ])
  })

  it('only walks through the main timeline', function () {
    const history = new History()

    const first = history.append(action)

    history.append(action)

    history.checkout(first)

    const third = history.append(action)

    expect(history.toArray()).toEqual([ first, third ])
  })

})
