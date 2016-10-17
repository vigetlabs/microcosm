import History from '../src/history'
import Microcosm from '../src/microcosm'

const action = n => n

test('adjusts the focal point when adding a node', function () {
  const history = new History()

  history.append(action)
  history.append(action)

  expect(history.head.behavior).toEqual(action)
})

test('archive moves all the way up to the focal point', function () {
  const history = new History(-Infinity)

  // One
  const one = history.append(action)

  // Two
  const two = history.append(action)

  // Three
  const three = history.append(action)

  history.checkout(two)

  // Mark for disposal
  one.resolve()
  two.resolve()

  // Three should be ignored!
  history.archive()

  expect(history.size).toEqual(0)
})

test('archive removes nodes until it returns false', function () {
  const history = new History()

  const one = history.append(action)
  const two = history.append(action)

  history.append(action)

  history.checkout(two)
  history.archive(() => false)

  expect(history.head).toEqual(two)
  expect(history.head.parent).toEqual(one)
})

test('only walks through the main timeline', function () {
  const history = new History()

  const first = history.append(action)

  history.append(action)

  history.checkout(first)

  const third = history.append(action)

  expect(history.toArray()).toEqual([ first, third ])
})

test('does not walk past the focal point', function () {
  const history = new History()

  let one = history.append(action)
  history.append(action)
  history.append(action)
  history.checkout(one)

  expect(history.toArray()).toEqual([ one ])
})

test('properly handles forks', function () {
  let history = new History()

  let one   = history.append(action)
  let two   = history.append(action)
  let three = history.append(action)

  history.checkout(two)

  let four = history.append(action)
  let five = history.append(action)

  expect(history.toArray()).toEqual([ one, two, four, five ])

  history.checkout(three)

  expect(history.toArray()).toEqual([ one, two, three ])
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

  expect(b.children).toEqual([d, c])
})

describe('toArray', function() {

  test('does not generate null nodes', function() {
    const history = new History()

    expect(history.toArray()).toEqual([])
  })

})

describe('reduce', function() {

  test('Reduces all nodes in the active branch', function() {
    const history = new History()

    const a = history.append(n => n)
    const b = history.append(n => n)
    const c = history.append(n => n)

    const list = history.reduce((a, b) => a.concat(b), [])

    expect(list).toEqual([a,b,c])
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
