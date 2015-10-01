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

  it ('can remove all traces of a node', function() {
    let tree = new Tree()

    let one   = tree.append('one')
    let two   = tree.append('two')
    let three = tree.append('three')
    let four  = tree.append('four')

    tree.remove(three)

    three.children.forEach(function(child) {
      assert.equal(child.parent, two)
    })
  })

  it ('removing a focused node moves focus to the next position', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')
    let three = tree.append('three')

    tree.setFocus(two)
    tree.remove(two)

    assert.equal(tree.focus, three)
  })

  it ('removing a focused node moves focus to the parent if there is no next kin', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')

    tree.setFocus(two)
    tree.remove(two)

    assert.equal(tree.focus, one)
  })

  it ('removing a focused node sets focus to null if there is no previous node', function() {
    let tree = new Tree('one')

    tree.remove(tree.focus)

    assert.equal(tree.focus, null)
  })

  it ('can create a connection', function() {
    let tree = new Tree('foo')

    let foo = tree.focus
    let bar = tree.append('bar')

    assert.equal(foo.next, bar)
    assert.equal(bar.parent, foo)
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

  it ('can get the next node in the chain', function() {
    let tree = new Tree()

    let one = tree.append('one')
    let two = tree.append('two')
    let three = tree.append('three')

    assert.equal(one.next, two)
    assert.equal(two.next, three)
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
