import History from '../../../src/history'
import Microcosm from '../../../src/microcosm'

describe('History::checkout', function () {
  const action = n => n

  /*
   * Reproduce the following tree:
   *
   *     +-<2>
   * <1>-|
   *     +-<3>
   */
  it('updates the next values of nodes to follow the current branch', function () {
    const history = new History()

    history.append(action)

    // 1. Create a fork, a node that will have two branches
    const fork = history.append(action)

    // 2. Append a node to the active branch
    const top = history.append(action)

    // 3. Return to the root
    history.checkout(fork)

    // 4. Create a new branch by appending another node to the root
    const bottom = history.append(action)

    // 5. The fork's next node should be the bottom
    expect(fork.next).toEqual(bottom)

    // 6. Then return to the first branch
    history.checkout(top)

    // 7. The fork should point to the top
    expect(fork.next).toEqual(top)

    // 8. The top should point to nothing
    expect(top.next).toEqual(null)
  })

  it('raises an exception if checking out a null action', function () {
    const history = new History()

    history.append(action)

    expect(() => history.checkout()).toThrow()
  })

  it('properly handles forked branches', function () {
    let history = new History()

    let one   = history.append(action)
    let two   = history.append(action)
    let three = history.append(action)

    history.archive()
    history.checkout(two)

    let four = history.append(action)
    let five = history.append(action)

    expect(history.toArray()).toEqual([ one, two, four, five ])

    history.checkout(three)

    expect(history.toArray()).toEqual([ one, two, three ])
  })

})
