import { Microcosm, scheduler } from 'microcosm'

describe('History::toggle', function() {
  it('replaces history, skipping disabled actions', function() {
    let repo = new Microcosm({ debug: true })

    repo.addDomain('test', {
      getInitialState: () => 0,
      register() {
        return {
          add: (a, b) => a + b
        }
      }
    })

    repo.push('add', 2)
    let second = repo.push('add', 2)

    expect(repo.state.test).toBe(4)

    repo.history.toggle(second)

    expect(repo.state.test).toBe(2)
  })

  it('does not replay inactive branches', async function() {
    let repo = new Microcosm({ debug: true })

    repo.addDomain('test', {
      getInitialState: () => 0,
      register() {
        return {
          add: (a, b) => a + b
        }
      }
    })

    let one = repo.push('add', 1)
    let two = repo.push('add', 2)

    repo.history.checkout(one)

    repo.push('add', 3)

    // History is now:
    //   *one
    //   / \
    // two *three
    //
    // * indicates active branch
    expect(repo.state.test).toBe(4) // one + three

    let changed = jest.fn()

    repo.domains.test.subscribe({ next: changed })

    // Subscribing to test will immediately fire a change event. This
    // is subjects are eager.
    await scheduler()
    changed.mockClear()

    repo.history.toggle(two)

    expect(repo.state.test).toBe(4) // one + three

    await scheduler()

    expect(changed).toHaveBeenCalledTimes(0)
  })
})
