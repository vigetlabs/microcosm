import Tree from '../src/Tree'
import assert from 'assert'

describe('Tree', function() {

  let concat = (a, b) => a.concat(b)

  it ('adjusts the focal point when adding a node', function() {
    let tree = new Tree()

    tree.append('one')
    tree.append('two')
    assert.equal(tree.focus.value, 'two')
  })

  it ('prunes all the way up to the focal point', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')
    let three = tree.append('three')

    tree.checkout(two)
    tree.prune(node => true)

    assert.equal(tree.focus, null)
  })

  it ('prunes until it returns false', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')
    let three = tree.append('three')

    tree.checkout(two)
    tree.prune(node => false)

    assert.equal(tree.focus, two)
    assert.equal(tree.focus.parent, one)
  })

  it ('step back through the tree', function() {
    let tree = new Tree()

    tree.append('first')
    tree.append('second')
    tree.append('third')

    assert.deepEqual(tree.branch().reduce(concat, []), [ 'first', 'second', 'third' ])
  })

  it ('only walks through the main timeline', function() {
    let tree = new Tree()

    let first = tree.append('first')
    let second = tree.append('second')
    tree.checkout(first)
    let third = tree.append('third')

    assert.deepEqual(tree.branch().reduce(concat, []), [ 'first', 'third' ])
  })

  it ('does not walk past the focal point', function() {
    let tree = new Tree()

    let one = tree.append('one')
    tree.append('two')
    tree.append('three')
    tree.checkout(one)

    assert.deepEqual(tree.branch().reduce(concat, []), [ 'one' ])
  })

  it ('can get the path after a focus point', function() {
    let tree = new Tree()

    tree.append('one')
    tree.append('two')
    tree.append('three')

    assert.deepEqual(tree.branch().reduce(concat, []), [ 'one', 'two', 'three' ])
  })

  it ('properly handles forks', function() {
    let tree = new Tree()

    let one   = tree.append('one')
    let two   = tree.append('two')
    let three = tree.append('three')

    tree.checkout(two)

    let four = tree.append('four')
    let five = tree.append('five')

    assert.deepEqual(tree.branch().reduce(concat, []), [ 'one', 'two', 'four', 'five' ])

    tree.checkout(three)

    assert.deepEqual(tree.branch().reduce(concat, []), [ 'one', 'two', 'three' ])
  })

  it ('can get the previous node in the chain', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')
    let three = tree.append('three')

    assert.equal(two.parent, one)
    assert.equal(three.parent, two)
  })

  it ('can move backwards in the tree', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')

    tree.back()

    assert.equal(tree.focus, one)
  })

  it ('will not move back if there is no focus', function() {
    let tree = new Tree()

    tree.back()

    assert.equal(tree.focus, null)
  })

  it ('will not move backwards out of the tree', function() {
    let tree = new Tree()

    let one = tree.append('one')

    tree.back()
    tree.back()

    assert.equal(tree.focus, one)
  })

  it ('can move forward in the tree', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')

    tree.checkout(one)
    assert.equal(tree.focus, one)

    tree.forward()
    assert.equal(tree.focus, two)
  })

  it ('will not move forward if there is no focus', function() {
    let tree = new Tree()

    tree.forward()

    assert.equal(tree.focus, null)
  })

  it ('will not move forward out of the tree', function() {
    let tree = new Tree()

    let one = tree.append('one')

    tree.forward()

    assert.equal(tree.focus, one)
  })

  it ('will not check out an undefined node', function() {
    let tree = new Tree()

    assert.throws(function() {
      tree.checkout()
    })
  })
})
