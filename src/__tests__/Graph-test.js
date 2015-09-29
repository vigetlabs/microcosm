import Graph from '../Graph'
import assert from 'assert'

describe('Graph', function() {

  it ('adjusts the focal point when adding a node', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    assert.equal(graph.focus, 'two')
  })

  it ('can remove all traces of a node', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')
    graph.append('four')
    graph.remove('three')

    graph.edges.forEach(function(edge) {
      assert(edge.indexOf('three') < 0)
    })
  })

  it ('removing a focused node moves focus to the next position', function() {
    let graph = new Graph('one')

    graph.append('two')
    graph.remove('one')

    assert.equal(graph.focus, 'two')
  })

  it ('removing a focused node sets focus to null if there is no next node', function() {
    let graph = new Graph('one')

    graph.remove('one')

    assert.equal(graph.focus, null)
  })

  it ('can create a connection', function() {
    let graph = new Graph('foo')

    graph.append('bar')

    assert.equal(graph.after('foo'), 'bar')

    assert.deepEqual(graph.edges.pop(), [ 'foo', 'bar' ])
  })

  it ('step back through the tree', function() {
    let graph = new Graph('first')

    graph.append('second')
    graph.append('third')

    assert.deepEqual(graph.path(), [ 'first', 'second', 'third' ])
  })

  it ('only walks through the main timeline', function() {
    let graph = new Graph()

    graph.append('first')
    graph.append('second')
    graph.setFocus('first')
    graph.append('third')

    assert.deepEqual(graph.path(), [ 'first', 'third' ])
  })

  it ('does not walk past the focal point', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')
    graph.setFocus('one')

    assert.deepEqual(graph.path(), [ 'one' ])
  })

  it ('does not focus on a node it does not own', function() {
    let graph = new Graph()

    graph.append('one')
    graph.setFocus('fiz')

    assert.deepEqual(graph.focus, 'one')
  })

  it ('can get the path after a focus point', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')

    assert.deepEqual(graph.path(), [ 'one', 'two', 'three' ])
  })

  it ('properly handles forks', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')
    graph.setFocus('two')
    graph.append('four')
    graph.append('five')

    assert.deepEqual(graph.path(), [ 'one', 'two', 'four', 'five' ])
  })

  it ('can get the next node in the chain', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')

    assert.equal(graph.after('one'), 'two')
    assert.equal(graph.after('two'), 'three')
  })

  it ('can get the previous node in the chain', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')

    assert.equal(graph.before('two'), 'one')
    assert.equal(graph.before('three'), 'two')
  })

  describe('tree()', function() {

    it ('can get a list of all nodes in order', function() {
      let graph = new Graph()

      graph.append('one')
      graph.append('two')
      graph.setFocus('one')
      graph.append('three')
      graph.append('four')

      let tree = graph.tree('one')

      assert.equal(tree.node, 'one')
      assert.equal(tree.children[0].node, 'two')
      assert.equal(tree.children[1].node, 'three')
      assert.equal(tree.children[1].children[0].node, 'four')
    })

    it ('just returns the first child when there are no edges', function() {
      let tree = new Graph('one').tree()

      assert.equal(tree.node, 'one')
    })

    it ('handles empty graphs', function() {
      let tree = new Graph().tree()

      assert.equal(tree.node, null)
      assert.deepEqual(tree.children, [])
    })

  })

})
