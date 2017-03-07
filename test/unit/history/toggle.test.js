import History from '../../../src/history'

describe('History::toggle', function () {
  const action = n => n

  it('can toggle a single action', function () {
    const history = new History(Infinity)

    let one = history.append(action, 'resolve')

    history.toggle(one)

    expect(one.disabled).toBe(true)
  })

  it('can toggle actions in bulk', function () {
    const history = new History(Infinity)

    let one = history.append(action, 'resolve')
    let two = history.append(action, 'resolve')
    let three = history.append(action, 'resolve')

    history.toggle([one, two, three])

    expect(one.disabled).toBe(true)
    expect(two.disabled).toBe(true)
    expect(three.disabled).toBe(true)
  })

  it('only reconciles once', function () {
    const history = new History(Infinity)

    let one = history.append(action, 'resolve')
    let two = history.append(action, 'resolve')
    let three = history.append(action, 'resolve')

    jest.spyOn(history, 'reconcile')

    history.toggle([ one, two, three ])

    expect(history.reconcile).toHaveBeenCalledTimes(1)
  })

})
