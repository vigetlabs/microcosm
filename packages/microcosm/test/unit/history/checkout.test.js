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

    let one = repo.push('one')
    let two = repo.push('two')
    let three = repo.push('three')
    let four = repo.push('four')

    repo.history.checkout(two)

    let five = repo.push('five')
    let six = repo.push('six')

    expect(repo.history.after(one)).toEqual(two)
    expect(repo.history.after(two)).toEqual(five)
    expect(repo.history.after(five)).toEqual(six)

    repo.history.checkout(four)

    expect(repo.history.after(one)).toEqual(two)
    expect(repo.history.after(two)).toEqual(three)
    expect(repo.history.after(three)).toEqual(four)
  })

  it('will not checkout a null action', function() {
    let repo = new Microcosm()

    try {
      repo.history.checkout()
    } catch (x) {
      expect(x.message).toContain('Unable to checkout missing action')
    }
  })

  it('reconciles on the supplied action if it is active', function() {
    let repo = new Microcosm()
    let one = repo.push(action)

    repo.push(action)

    let handler = jest.fn()

    repo.history.subscribe(handler)

    repo.history.checkout(one)

    expect(handler).toHaveBeenCalledWith(one)
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

    expect(`${Array.from(repo.history)}`).toEqual('one,two,five,six')

    repo.history.checkout(four)

    expect(`${Array.from(repo.history)}`).toEqual('one,two,three,four')
  })
})
