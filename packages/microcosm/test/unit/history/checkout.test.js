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
    let repo = new Microcosm({ debug: true })

    let one = repo.push(action)
    let two = repo.push(action)
    let three = repo.push(action)
    let four = repo.push(action)

    repo.history.checkout(two)

    let five = repo.push(action)
    let six = repo.push(action)

    expect(repo.history.next(one)).toEqual(two)
    expect(repo.history.next(two)).toEqual(five)
    expect(repo.history.next(five)).toEqual(six)

    repo.history.checkout(four)

    expect(repo.history.next(one)).toEqual(two)
    expect(repo.history.next(two)).toEqual(three)
    expect(repo.history.next(three)).toEqual(four)
  })

  it('will not checkout a null action', function() {
    let repo = new Microcosm()

    try {
      repo.history.checkout()
    } catch (x) {
      expect(x.message).toContain('Unable to checkout undefined action')
    }
  })

  it.skip('reconciles on the supplied action if it is active', function() {
    let repo = new Microcosm()

    let one = repo.push(action)
    repo.push(action)

    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.checkout(one)

    expect(spy).toHaveBeenCalledWith(one)
  })

  it('reconciles on the most recent shared node if hopping branches', function() {
    let repo = new Microcosm({ debug: true })

    repo.addDomain('test', {
      register() {
        return {
          [action]: (a, b) => b
        }
      }
    })

    let one = repo.push(action, 1)
    let two = repo.push(action, 2)

    repo.history.checkout(one)
    repo.push(action, 3)

    repo.history.checkout(two)

    expect(repo).toHaveState('test', 2)
  })

  it('properly handles forked branches', function() {
    let repo = new Microcosm({ debug: true })

    repo.push('one')
    let two = repo.push('two')
    repo.push('three')
    let four = repo.push('four')

    repo.history.checkout(two)

    repo.push('five')
    repo.push('six')

    expect(`${Array.from(repo.history).map(a => a.tag)}`).toEqual(
      'one,two,five,six'
    )

    repo.history.checkout(four)

    expect(`${Array.from(repo.history).map(a => a.tag)}`).toEqual(
      'one,two,three,four'
    )
  })
})
