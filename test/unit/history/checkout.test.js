import History from '../../../src/history'

describe('History::checkout', function() {
  const action = n => n

  /*
   * Set up the following tree:
   *
   *               |- [three] - [four]
   * [one] - [two] +
   *               |- [five] - [*six]
   */
  it('updates the next values of nodes to follow the current branch', function() {
    let history = new History()

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)
    let four = history.append(action)

    history.checkout(two)

    let five = history.append(action)
    let six = history.append(action)

    expect(one.next).toEqual(two)
    expect(two.next).toEqual(five)
    expect(five.next).toEqual(six)

    history.checkout(four)

    expect(one.next).toEqual(two)
    expect(two.next).toEqual(three)
    expect(three.next).toEqual(four)
  })

  it('checks out the head if no action is specified', function() {
    const history = new History()

    jest.spyOn(history, 'reconcile')

    history.checkout()

    expect(history.reconcile).toHaveBeenCalledWith(history.head)
  })

  it('reconciles on the supplied action if it is active', function() {
    let history = new History()

    let one = history.append(action)
    history.append(action)

    jest.spyOn(history, 'reconcile')

    history.checkout(one)

    expect(history.reconcile).toHaveBeenCalledWith(one)
  })

  it('reconciles on the most recent shared node if hopping branches', function() {
    let history = new History()

    let one = history.append(action)
    let two = history.append(action)
    history.checkout(one)
    history.append(action)

    jest.spyOn(history, 'reconcile')

    history.checkout(two)

    expect(history.reconcile).toHaveBeenCalledWith(one)
  })

  it('properly handles forked branches', function() {
    let history = new History()

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)
    let four = history.append(action)

    history.archive()
    history.checkout(two)

    let five = history.append(action)
    let six = history.append(action)

    expect(history.toArray()).toEqual([one, two, five, six])

    history.checkout(four)

    expect(history.toArray()).toEqual([one, two, three, four])
  })
})
