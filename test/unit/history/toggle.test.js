import History from '../../../src/history'

describe('History::toggle', function() {
  const action = n => n

  it('can toggle a single action', function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action, 'resolve')

    history.toggle(one)

    expect(one.disabled).toBe(true)
  })

  it('can toggle actions in bulk', function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action, 'resolve')
    let two = history.append(action, 'resolve')
    let three = history.append(action, 'resolve')

    history.toggle([one, two, three])

    expect(one.disabled).toBe(true)
    expect(two.disabled).toBe(true)
    expect(three.disabled).toBe(true)
  })

  it('only reconciles once', function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action, 'resolve')
    let two = history.append(action, 'resolve')
    let three = history.append(action, 'resolve')

    jest.spyOn(history, 'reconcile')

    history.toggle([one, two, three])

    expect(history.reconcile).toHaveBeenCalledTimes(1)
  })

  it('does not reconcile if toggling an inactive action', function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action, 'resolve')
    let two = history.append(action, 'resolve')
    history.checkout(one)
    history.append(action, 'resolve')

    jest.spyOn(history, 'reconcile')

    history.toggle(two)

    expect(history.reconcile).not.toHaveBeenCalled()
  })

  it('reconciles on the oldest active action', function() {
    const history = new History({ maxHistory: Infinity })

    let one = history.append(action, 'resolve')
    let two = history.append(action, 'resolve')
    history.checkout(one)
    let three = history.append(action, 'resolve')
    let four = history.append(action, 'resolve')

    jest.spyOn(history, 'reconcile')

    history.toggle([four, two, three])

    expect(history.reconcile).toHaveBeenCalledWith(three)
  })
})
