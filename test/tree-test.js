import Tree   from '../src/tree'
import assert from 'assert'

const toArray = function (list, node) {
  return list.concat(node)
}

describe('Tree', function() {
  let concat = (a, b) => a.concat(b.action)
  let action = n => n

  it ('adjusts the focal point when adding a node', function() {
    let tree = new Tree()

    tree.append(action)
    tree.append(action)
    assert.equal(tree.focus.behavior, action)
  })

  it ('prunes all the way up to the focal point', function() {
    let tree = new Tree()

    let one = tree.append(action)
    let two = tree.append(action)
    let three = tree.append(action)

    tree.checkout(two)
    tree.prune(node => true)

    assert.equal(tree.focus, null)
  })

  it ('prunes until it returns false', function() {
    let tree = new Tree()

    let one = tree.append(action)
    let two = tree.append(action)
    let three = tree.append(action)

    tree.checkout(two)
    tree.prune(node => false)

    assert.equal(tree.focus, two)
    assert.equal(tree.focus.parent, one)
  })

  it ('only walks through the main timeline', function() {
    let tree = new Tree()

    let first = tree.append(action)
    let second = tree.append(action)
    tree.checkout(first)
    let third = tree.append(action)

    assert.deepEqual(tree.reduce(toArray, []), [ first, third ])
  })

  it ('does not walk past the focal point', function() {
    let tree = new Tree()

    let one = tree.append(action)
    tree.append(action)
    tree.append(action)
    tree.checkout(one)

    assert.deepEqual(tree.reduce(toArray, []), [ one ])
  })

  it ('properly handles forks', function() {
    let tree = new Tree()

    let one   = tree.append(action)
    let two   = tree.append(action)
    let three = tree.append(action)

    tree.checkout(two)

    let four = tree.append(action)
    let five = tree.append(action)

    assert.deepEqual(tree.reduce(toArray, []), [ one, two, four, five ])

    tree.checkout(three)

    assert.deepEqual(tree.reduce(toArray, []), [ one, two, three ])
  })

  it ('can get the previous node in the chain', function() {
    let tree = new Tree()

    let one = tree.append(action)
    let two = tree.append(action)
    let three = tree.append(action)

    assert.equal(two.parent, one)
    assert.equal(three.parent, two)
  })

  it ('will not check out an undefined node', function() {
    let tree  = new Tree()

    let first = tree.append(action)

    tree.checkout()

    assert.equal(tree.focus, first)
  })

  it ('will not check out a null node', function() {
    let tree = new Tree()

    let first = tree.append(action)

    tree.checkout(null)

    assert.equal(tree.focus, first)
  })

  it ('can determine the root node', function() {
    let tree = new Tree()

    let a = tree.append(action)
    let b = tree.append(action)
    let c = tree.append(action)

    assert.equal(tree.root, a)
  })

  it ('can determine children', function() {
    let tree = new Tree()
    let a = tree.append(action)
    let b = tree.append(action)

    tree.checkout(a)

    let c = tree.append(action)

    assert.deepEqual(a.children, [ c, b ])
  })

  it ('does not lose children when checking out nodes on the left', function() {
    let tree = new Tree()
    let a = tree.append(action)
    let b = tree.append(action)
    let c = tree.append(action)

    tree.checkout(b)

    let d = tree.append(action)

    assert.deepEqual(b.children, [ d, c ])
  })

  it ('does not lose children when checking out nodes on the right', function() {
    let tree = new Tree()
    let a = tree.append(action)
    let b = tree.append(action)
    let c = tree.append(action)

    tree.checkout(b)

    let d = tree.append(action)

    tree.checkout(c)
    assert.deepEqual(b.children, [c, d])
  })
})
