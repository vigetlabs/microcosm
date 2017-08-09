import Microcosm from '../../../src/microcosm'

describe('History::toggle', function() {
  const action = n => n

  it('can toggle a single action', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push(action)

    repo.history.toggle(one)

    expect(one.disabled).toBe(true)
  })

  it('can toggle actions in bulk', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.append(action, 'resolve')
    let two = repo.append(action, 'resolve')
    let three = repo.append(action, 'resolve')

    repo.history.toggle([one, two, three])

    expect(one.disabled).toBe(true)
    expect(two.disabled).toBe(true)
    expect(three.disabled).toBe(true)
  })

  it('only reconciles once', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push('one')
    let two = repo.push('two')
    let three = repo.push('three')

    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.history.toggle([one, two, three])

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('does not reconcile if toggling an inactive action', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push('one')
    let two = repo.push('two')

    repo.checkout(one)
    repo.push('three')

    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.history.toggle(two)

    expect(spy).not.toHaveBeenCalled()
  })

  it('reconciles on the oldest active action', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push('one')
    let two = repo.push('two')

    repo.checkout(one)

    let three = repo.push('three')
    let four = repo.push('four')

    let spy = jest.spyOn(repo.history, 'reconcile')

    repo.history.toggle([four, two, three])

    expect(spy).toHaveBeenCalledWith(three)
  })
})
