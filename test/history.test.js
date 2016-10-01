import test from 'ava'
import History from '../src/history'

const action = n => n

test('adjusts the focal point when adding a node', t => {
  const history = new History()

  history.append(action)
  history.append(action)

  t.is(history.focus.behavior, action)
})

test('prunes all the way up to the focal point', t => {
  const history = new History(-Infinity)

  // One
  const one = history.append(action)

  // Two
  const two = history.append(action)

  // Three
  const three = history.append(action)

  history.checkout(two)

  // Mark for disposal
  one.close()
  two.close()

  // Three should be ignored!
  history.prune()

  t.is(history.size, 0)
})

test('prunes removes nodes until it returns false', t => {
  const history = new History()

  const one = history.append(action)
  const two = history.append(action)

  history.append(action)

  history.checkout(two)
  history.prune(() => false)

  t.is(history.focus, two)
  t.is(history.focus.parent, one)
})

test('only walks through the main timeline', t => {
  const history = new History()

  const first = history.append(action)

  history.append(action)

  history.checkout(first)

  const third = history.append(action)

  t.deepEqual(history.toArray(), [ first, third ])
})

test('does not walk past the focal point', t => {
  const history = new History()

  let one = history.append(action)
  history.append(action)
  history.append(action)
  history.checkout(one)

  t.deepEqual(history.toArray(), [ one ])
})

test('properly handles forks', t => {
  let history = new History()

  let one   = history.append(action)
  let two   = history.append(action)
  let three = history.append(action)

  history.checkout(two)

  let four = history.append(action)
  let five = history.append(action)

  t.deepEqual(history.toArray(), [ one, two, four, five ])

  history.checkout(three)

  t.deepEqual(history.toArray(), [ one, two, three ])
})

test('can get the previous node in the chain', t => {
  const history = new History()

  const one = history.append(action)
  const two = history.append(action)
  const three = history.append(action)

  t.is(two.parent, one)
  t.is(three.parent, two)
})

test('sets the root to null if checking out a null node', t => {
  const history  = new History()
  history.append(action)

  history.checkout()

  t.is(history.root, null)
  t.is(history.focus, null)
})

test('can determine the root node', t => {
  const history = new History()

  const a = history.append(action)

  history.append(action)
  history.append(action)

  t.is(history.root, a)
})

test('can determine children', t => {
  const history = new History()
  const a = history.append(action)
  const b = history.append(action)

  history.checkout(a)

  const c = history.append(action)

  t.deepEqual(a.children, [ c, b ])
})

test('does not lose children when checking out nodes on the left', t => {
  const history = new History()

  history.append(action)

  const b = history.append(action)
  const c = history.append(action)

  history.checkout(b)

  const d = history.append(action)

  t.deepEqual(b.children, [ d, c ])
})

test('does not lose children when checking out nodes on the right', t => {
  const history = new History()

  history.append(action)

  const b = history.append(action)
  const c = history.append(action)

  history.checkout(b)

  const d = history.append(action)

  history.checkout(c)

  t.deepEqual(b.children, [d, c])
})
