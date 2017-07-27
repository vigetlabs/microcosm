import Microcosm from '../../src/microcosm'

describe('Re-executing domain handlers', function() {
  it('does not re-invoke a domain handler if it would result in no change', function() {
    let repo = new Microcosm()

    let counterOneCalls = 0
    let counterTwoCalls = 0

    repo.addDomain('counterOne', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        counterOneCalls += 1
        return count + n
      },
      register() {
        return {
          addOne: this.add
        }
      }
    })

    repo.addDomain('counterTwo', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        counterTwoCalls += 1
        return count + n
      },
      register() {
        return {
          addTwo: this.add
        }
      }
    })

    let one = repo.append('addOne')

    repo.push('addTwo', 2)

    one.resolve(1)

    expect(counterOneCalls).toBe(1)
    expect(counterTwoCalls).toBe(1)
    expect(repo.state).toEqual({ counterOne: 1, counterTwo: 2 })
  })

  it('domains in a fork do not invalidate the parent when both register the same action', function() {
    let parent = new Microcosm()

    let counterOneCalls = 0
    let counterTwoCalls = 0

    parent.addDomain('counterOne', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        counterOneCalls += 1

        return count + n
      },
      register() {
        return { test: this.add }
      }
    })

    let child = parent.fork()

    counterTwoCalls += 1
    child.addDomain('counterTwo', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        counterTwoCalls += 1
        return count + n
      },
      register() {
        return { test: this.add }
      }
    })

    let one = parent.append('test')

    parent.push('test', 2)

    one.resolve(1)

    // The parent should get updates, but not state managed by a child
    expect(parent).toHaveState('counterOne', 3)
    expect(parent).not.toHaveState('counterTwo')

    // The child gets upstream updates, but maintains its own state
    expect(child).toHaveState('counterOne', 3)
    expect(child).toHaveState('counterTwo', 3)

    // There are two actions. We expect three calls:
    // 1. two.resolve - one is pending, dispatch two
    // 2. one.resolve - one completed, dispatch one
    // 3. two.resolve - since one changed count, re-dispatch two
    expect(counterOneCalls).toBe(3)
    expect(counterTwoCalls).toBe(3)
  })
})
