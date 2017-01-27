import History from '../src/history'
import Microcosm from '../src/microcosm'

const action = n => n
const toArray = function (history) {
  let items = new Array()
  let node  = history.focus || history.root

  while (node) {
    items.push(node)

    if (node === history.head) {
      break
    }

    node = node.next
  }

  return items
}

test('adjusts the focal point when adding a node', function () {
  const history = new History()

  history.append(action)
  history.append(action)

  expect(history.head.behavior).toEqual(action)
})

test('handles cases where a repo might be lost during a reconcilation', function () {
  const parent = new Microcosm()
  const child = parent.fork()

  parent.on('change', function() {
    child.teardown()
  })

  parent.patch({ test: true })
})

test('only walks through the main timeline', function () {
  const history = new History()

  const first = history.append(action)

  history.append(action)

  history.checkout(first)

  const third = history.append(action)

  expect(toArray(history)).toEqual([ first, third ])
})

test('does not walk past the focal point', function () {
  const history = new History()

  let one = history.append(action)
  history.append(action)
  history.append(action)
  history.checkout(one)

  expect(toArray(history)).toEqual([ one ])
})

test('properly handles forks', function () {
  let history = new History()

  let one   = history.append(action)
  let two   = history.append(action)
  let three = history.append(action)

  history.checkout(two)

  let four = history.append(action)
  let five = history.append(action)

  expect(toArray(history)).toEqual([ one, two, four, five ])

  history.checkout(three)

  expect(toArray(history)).toEqual([ one, two, three ])
})

test('can get the previous node in the chain', function () {
  const history = new History()

  const one = history.append(action)
  const two = history.append(action)
  const three = history.append(action)

  expect(two.parent).toEqual(one)
  expect(three.parent).toEqual(two)
})

test('sets the root to null if checking out a null node', function () {
  const history  = new History()
  history.append(action)

  history.checkout()

  expect(history.root).toEqual(null)
  expect(history.head).toEqual(null)
})

test('can determine the root node', function () {
  const history = new History()

  const a = history.append(action)

  history.append(action)
  history.append(action)

  expect(history.root).toEqual(a)
})

describe('children', function () {

  test('can determine children', function () {
    const history = new History()
    const a = history.append(action)
    const b = history.append(action)

    history.checkout(a)

    const c = history.append(action)

    expect(a.children).toEqual([ c, b ])
  })

  test('does not lose children when checking out nodes on the left', function () {
    const history = new History()

    history.append(action)

    const b = history.append(action)
    const c = history.append(action)

    history.checkout(b)

    const d = history.append(action)

    expect(b.children).toEqual([ d, c ])
  })

  test('does not lose children when checking out nodes on the right', function () {
    const history = new History()

    history.append(action)

    const b = history.append(action)
    const c = history.append(action)

    history.checkout(b)

    const d = history.append(action)

    history.checkout(c)

    expect(b.children).toEqual([ d, c ])
  })

})

describe('archival', function () {

  test('archive moves all the way up to the focal point', function () {
    const history = new History(-Infinity)

    // One
    const one = history.append(action)

    // Two
    const two = history.append(action)

    // Three
    history.append(action)

    history.checkout(two)

    // Mark for disposal
    one.resolve()
    two.resolve()

    // Three should be ignored!
    history.rollforward()

    expect(history.size).toEqual(0)
    expect(history.root).toEqual(null)
  })

  test('will not archive a node if prior nodes are not complete', function () {
    const history = new History()

    // one
    history.append(action)

    // two
    history.append(action)

    // three
    history.append(action).resolve()

    history.rollforward()

    expect(history.size).toBe(3)
  })

  test('archives all completed actions', function () {
    const history = new History()

    const one = history.append(action)
    const two = history.append(action)

    // three
    history.append(action)

    two.resolve()
    one.resolve()

    history.rollforward()

    expect(history.size).toBe(1)
  })

  test('archived nodes have no relations', function () {
    const history = new History()

    const one = history.append(action).resolve()
    const two = history.append(action)

    history.rollforward()

    expect(one.parent).toBe(null)
    expect(two.parent).toBe(null)
  })

  test('archiving the entire tree clears cursors', function () {
    const history = new History()

    // one
    history.append(action).resolve()
    // two
    history.append(action).resolve()

    history.rollforward()

    expect(history.focus).toBe(null)
    expect(history.root).toBe(null)
    expect(history.head).toBe(null)
  })

})

describe('repo management', function() {

  test('Does not remove a repo outside of the tracked repo', function() {
    const history = new History()
    const repo = new Microcosm()

    history.addRepo(repo)
    history.removeRepo(new Microcosm())

    expect(history.repos).toEqual([repo])
  })

})

describe('checkout', function () {

  /*
   * Reproduce the following tree:
   *
   *     +-<2>
   * <1>-|
   *     +-<3>
   */
  test('updates the next values of nodes to follow the current branch', function () {
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

})
