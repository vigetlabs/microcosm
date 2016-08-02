import test from 'ava'
import Tree from '../src/tree'

const action = n => n

test('adjusts the focal point when adding a node', t => {
  const tree = new Tree()

  tree.append(action)
  tree.append(action)

  t.is(tree.focus.behavior, action)
})

test('prunes all the way up to the focal point', t => {
  const tree = new Tree()

  // One
  tree.append(action)

  // Two
  const two = tree.append(action)

  // Three
  tree.append(action)

  tree.checkout(two)
  tree.prune(() => true)

  t.is(tree.focus, null)
})

test('prunes removes nodes until it returns false', t => {
  const tree = new Tree()

  const one = tree.append(action)
  const two = tree.append(action)

  tree.append(action)

  tree.checkout(two)
  tree.prune(() => false)

  t.is(tree.focus, two)
  t.is(tree.focus.parent, one)
})

test('only walks through the main timeline', t => {
  const tree = new Tree()

  const first = tree.append(action)

  tree.append(action)

  tree.checkout(first)

  const third = tree.append(action)

  t.deepEqual(tree.toArray(), [ first, third ])
})

test('does not walk past the focal point', t => {
  const tree = new Tree()

  let one = tree.append(action)
  tree.append(action)
  tree.append(action)
  tree.checkout(one)

  t.deepEqual(tree.toArray(), [ one ])
})

test('properly handles forks', t => {
  let tree = new Tree()

  let one   = tree.append(action)
  let two   = tree.append(action)
  let three = tree.append(action)

  tree.checkout(two)

  let four = tree.append(action)
  let five = tree.append(action)

  t.deepEqual(tree.toArray(), [ one, two, four, five ])

  tree.checkout(three)

  t.deepEqual(tree.toArray(), [ one, two, three ])
})

test('can get the previous node in the chain', t => {
  const tree = new Tree()

  const one = tree.append(action)
  const two = tree.append(action)
  const three = tree.append(action)

  t.is(two.parent, one)
  t.is(three.parent, two)
})

test('sets the root to null if checking out a null node', t => {
  const tree  = new Tree()
  tree.append(action)

  tree.checkout()

  t.is(tree.root, null)
  t.is(tree.focus, null)
})

test('can determine the root node', t => {
  const tree = new Tree()

  const a = tree.append(action)

  tree.append(action)
  tree.append(action)

  t.is(tree.root, a)
})

test('can determine children', t => {
  const tree = new Tree()
  const a = tree.append(action)
  const b = tree.append(action)

  tree.checkout(a)

  const c = tree.append(action)

  t.deepEqual(a.children, [ c, b ])
})

test('does not lose children when checking out nodes on the left', t => {
  const tree = new Tree()

  tree.append(action)

  const b = tree.append(action)
  const c = tree.append(action)

  tree.checkout(b)

  const d = tree.append(action)

  t.deepEqual(b.children, [ d, c ])
})

test('does not lose children when checking out nodes on the right', t => {
  const tree = new Tree()

  tree.append(action)

  const b = tree.append(action)
  const c = tree.append(action)

  tree.checkout(b)

  const d = tree.append(action)

  tree.checkout(c)

  t.deepEqual(b.children, [d, c])
})
