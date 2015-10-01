import Graph from '../Graph'
import assert from 'assert'

describe('Graph', function() {

  it ('adjusts the focal point when adding a node', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    assert.equal(graph.focus.value, 'two')
  })

  it ('can remove all traces of a node', function() {
    let graph = new Graph()

    let one   = graph.append('one')
    let two   = graph.append('two')
    let three = graph.append('three')
    let four  = graph.append('four')

    graph.remove(three)

    three.children.forEach(function(child) {
      assert.equal(child.parent, two)
    })
  })

  it ('removing a focused node moves focus to the next position', function() {
    let graph = new Graph()

    let one = graph.append('one')
    let two = graph.append('two')
    let three = graph.append('three')

    graph.setFocus(two)
    graph.remove(two)

    assert.equal(graph.focus, three)
  })

  it ('removing a focused node moves focus to the parent if there is no next kin', function() {
    let graph = new Graph()

    let one = graph.append('one')
    let two = graph.append('two')

    graph.setFocus(two)
    graph.remove(two)

    assert.equal(graph.focus, one)
  })

  it ('removing a focused node sets focus to null if there is no previous node', function() {
    let graph = new Graph('one')

    graph.remove(graph.focus)

    assert.equal(graph.focus, null)
  })

  it ('can create a connection', function() {
    let graph = new Graph('foo')

    let foo = graph.focus
    let bar = graph.append('bar')

    assert.equal(graph.after(foo), bar)
    assert.equal(graph.before(bar), foo)
  })

  it ('step back through the tree', function() {
    let graph = new Graph('first')

    graph.append('second')
    graph.append('third')

    assert.deepEqual(graph.values(), [ 'first', 'second', 'third' ])
  })

  it ('only walks through the main timeline', function() {
    let graph = new Graph()

    let first = graph.append('first')
    let second = graph.append('second')
    graph.setFocus(first)
    let third = graph.append('third')

    assert.deepEqual(graph.values(), [ 'first', 'third' ])
  })

  it ('does not walk past the focal point', function() {
    let graph = new Graph()

    let one = graph.append('one')
    graph.append('two')
    graph.append('three')
    graph.setFocus(one)

    assert.deepEqual(graph.values(), [ 'one' ])
  })

  it ('can get the path after a focus point', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')

    assert.deepEqual(graph.values(), [ 'one', 'two', 'three' ])
  })

  it ('properly handles forks', function() {
    let graph = new Graph()

    graph.append('one')
    let two = graph.append('two')
    graph.append('three')
    graph.setFocus(two)
    graph.append('four')
    graph.append('five')

    assert.deepEqual(graph.values(), [ 'one', 'two', 'four', 'five' ])
  })

  it ('can get the next node in the chain', function() {
    let graph = new Graph()

    let one = graph.append('one')
    let two = graph.append('two')
    let three = graph.append('three')

    assert.equal(graph.after(one), two)
    assert.equal(graph.after(two), three)
  })

  it ('can get the previous node in the chain', function() {
    let graph = new Graph()

    let one = graph.append('one')
    let two = graph.append('two')
    let three = graph.append('three')

    assert.equal(graph.before(two), one)
    assert.equal(graph.before(three), two)
  })

  it ('can move backwards in the tree', function() {
    let graph = new Graph()

    let one = graph.append('one')
    let two = graph.append('two')

    graph.back()

    assert.equal(graph.focus, one)
  })

  it ('will not move backwards out of the tree', function() {
    let graph = new Graph()

    let one = graph.append('one')

    graph.back()
    graph.back()

    assert.equal(graph.focus, one)
  })

  it ('can move forward in the tree', function() {
    let graph = new Graph()

    let one = graph.append('one')
    let two = graph.append('two')

    graph.setFocus(one)
    assert.equal(graph.focus, one)

    graph.forward()
    assert.equal(graph.focus, two)
  })

  it ('will not move forward out of the tree', function() {
    let graph = new Graph()

    let one = graph.append('one')

    graph.forward()

    assert.equal(graph.focus, one)
  })

})
