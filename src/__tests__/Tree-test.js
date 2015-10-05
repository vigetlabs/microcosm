import Tree from '../Tree'
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

    tree.setFocus(two)
    tree.prune(node => true)

    assert.equal(tree.focus, two)
    assert.equal(tree.focus.parent, null)
  })

  it ('prunes until it returns false', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')
    let three = tree.append('three')

    tree.setFocus(two)
    tree.prune(node => false)

    assert.equal(tree.focus, two)
    assert.equal(tree.focus.parent, one)
  })

  it ('step back through the tree', function() {
    let tree = new Tree('first')

    tree.append('second')
    tree.append('third')

    assert.deepEqual(tree.reduce(concat, []), [ 'first', 'second', 'third' ])
  })

  it ('only walks through the main timeline', function() {
    let tree = new Tree()

    let first = tree.append('first')
    let second = tree.append('second')
    tree.setFocus(first)
    let third = tree.append('third')

    assert.deepEqual(tree.reduce(concat, []), [ 'first', 'third' ])
  })

  it ('does not walk past the focal point', function() {
    let tree = new Tree()

    let one = tree.append('one')
    tree.append('two')
    tree.append('three')
    tree.setFocus(one)

    assert.deepEqual(tree.reduce(concat, []), [ 'one' ])
  })

  it ('can get the path after a focus point', function() {
    let tree = new Tree()

    tree.append('one')
    tree.append('two')
    tree.append('three')

    assert.deepEqual(tree.reduce(concat, []), [ 'one', 'two', 'three' ])
  })

  it ('properly handles forks', function() {
    let tree = new Tree()

    tree.append('one')
    let two = tree.append('two')
    tree.append('three')
    tree.setFocus(two)
    tree.append('four')
    tree.append('five')

    assert.deepEqual(tree.reduce(concat, []), [ 'one', 'two', 'four', 'five' ])
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

    tree.setFocus(one)
    assert.equal(tree.focus, one)

    tree.forward()
    assert.equal(tree.focus, two)
  })

  it ('will not move forward out of the tree', function() {
    let tree = new Tree()

    let one = tree.append('one')

    tree.forward()

    assert.equal(tree.focus, one)
  })

})
