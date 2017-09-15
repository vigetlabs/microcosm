import Microcosm from 'microcosm'

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
    let repo = new Microcosm()

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)
    let four = repo.append(action)

    repo.checkout(two)

    let five = repo.append(action)
    let six = repo.append(action)

    expect(one.next).toEqual(two)
    expect(two.next).toEqual(five)
    expect(five.next).toEqual(six)

    repo.checkout(four)

    expect(one.next).toEqual(two)
    expect(two.next).toEqual(three)
    expect(three.next).toEqual(four)
  })

  it('checks out the head if no action is specified', function() {
    let repo = new Microcosm()
    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.checkout()

    expect(spy).toHaveBeenCalledWith(repo.history.head)
  })

  it('reconciles on the supplied action if it is active', function() {
    let repo = new Microcosm()

    let one = repo.append(action)
    repo.append(action)

    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.checkout(one)

    expect(spy).toHaveBeenCalledWith(one)
  })

  it('reconciles on the most recent shared node if hopping branches', function() {
    let repo = new Microcosm()

    let one = repo.append(action)
    let two = repo.append(action)

    repo.checkout(one)
    repo.append(action)

    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.checkout(two)

    expect(spy).toHaveBeenCalledWith(one)
  })

  it('properly handles forked branches', function() {
    let repo = new Microcosm()

    repo.append('one')
    let two = repo.append('two')
    repo.append('three')
    let four = repo.append('four')

    repo.history.archive()
    repo.checkout(two)

    repo.append('five')
    repo.append('six')

    expect(`${repo.history.toArray()}`).toEqual('one,two,five,six')

    repo.checkout(four)

    expect(`${repo.history.toArray()}`).toEqual('one,two,three,four')
  })
})
