import Microcosm from 'microcosm'

describe('History::toggle', function() {
  const action = n => n

  it('can toggle a single action', function() {
    const repo = new Microcosm({ debug: true })

    let one = repo.push(action)

    repo.history.toggle(one)

    expect(one.disabled).toBe(true)
  })

  it('does not reconcile if toggling an inactive action', function() {
    const repo = new Microcosm({ debug: true })

    let one = repo.push('one')
    let two = repo.push('two')

    repo.history.checkout(one)
    repo.push('three')

    let handler = jest.fn()

    repo.history.updates.subscribe(handler)
    repo.history.toggle(two)

    expect(handler).not.toHaveBeenCalled()
  })
})
