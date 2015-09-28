import Graph from '../Graph'
import assert from 'assert'

describe('Graph', function() {

  it ('adjusts the focal point when adding a node', function() {
    let graph = new Graph()

    graph.add('one')
    assert.equal(graph.focus, 'one')

    graph.add('two')
    assert.equal(graph.focus, 'two')
  })

  it ('does not add undefined values', function() {
    let graph = new Graph()

    assert.throws(() => graph.add(undefined), /Graph unable to add node/)
  })

  it ('does not add a node twice', function() {
    let graph = new Graph()

    graph.add('one')
    graph.add('one')

    assert.equal(graph.nodes.length, 1)
  })

  it ('adjusts the focal point back when adding an existing node', function() {
    let graph = new Graph()

    graph.add('one')
    graph.add('two')
    graph.add('one')

    assert.equal(graph.focus, 'one')
  })

  it ('can remove all traces of a node', function() {
    let graph = new Graph()

    graph.connect('one', 'two')
    graph.connect('three', 'four')

    graph.remove('three')

    assert(graph.nodes.indexOf('three') < 0)

    graph.edges.forEach(function(edge) {
      assert(edge.indexOf('three') < 0)
    })
  })

  it ('removing a focused node moves focus to the next position', function() {
    let graph = new Graph()

    graph.connect('one', 'two')
    graph.remove('one')

    assert.equal(graph.focus, 'two')
  })

  it ('removing a focused node sets focus to null if there is no next node', function() {
    let graph = new Graph()

    graph.add('one')
    graph.remove('one')

    assert.equal(graph.focus, null)
  })

  it ('can create a connection', function() {
    let graph = new Graph()

    graph.connect('foo', 'bar')

    assert.equal(graph.after('foo'), 'bar')

    assert.deepEqual(graph.edges[0], [ 'foo', 'bar' ])
  })

  it ('can walk through time', function() {
    let graph = new Graph()

    graph.connect('first', 'second')
    graph.connect('second', 'third')

    assert.deepEqual(graph.pathway(), [ 'first', 'second', 'third' ])
  })

  it ('only walks through the main timeline', function() {
    let graph = new Graph()

    graph.connect('first', 'second')
    graph.connect('first', 'third')

    assert.deepEqual(graph.pathway(), [ 'first', 'third' ])
  })

  it ('can append a connection to the last node', function() {
    let graph = new Graph([ 'one' ])

    graph.append('two')

    assert.equal(graph.after('one'), 'two')
  })

  it ('can can recurse through time', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.setFocus('one')
    graph.append('three')

    assert.deepEqual(graph.pathway(), [ 'one', 'three'])
  })

  it ('does not walk past the focal point', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')
    graph.setFocus('one')

    assert.deepEqual(graph.pathway(), [ 'one' ])
  })

  it ('does not focus on a node it does not own', function() {
    let graph = new Graph()

    graph.append('one')
    graph.setFocus('fiz')

    assert.deepEqual(graph.focus, 'one')
  })

  it ('can get pathway after a focus point', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')

    assert.deepEqual(graph.pathway(), [ 'one', 'two', 'three' ])
  })

  it ('properly handles forks', function() {
    let graph = new Graph()

    graph.append('one')
    graph.append('two')
    graph.append('three')
    graph.setFocus('two')
    graph.append('four')
    graph.append('five')

    assert.deepEqual(graph.pathway(), [ 'one', 'two', 'four', 'five' ])
  })

  it ('can get the next node in the chain', function() {
    let graph = new Graph()

    graph.connect('one', 'two')
    graph.connect('two', 'three')

    assert.equal(graph.after('one'), 'two')
    assert.equal(graph.after('two'), 'three')
  })

  it ('can get the previous node in the chain', function() {
    let graph = new Graph()

    graph.connect('one', 'two')
    graph.connect('two', 'three')

    assert.equal(graph.before('two'), 'one')
    assert.equal(graph.before('three'), 'two')
  })

  it ('uses the most recent edge to determine connection (ensure proper edge insertion order)', function() {
    let graph = new Graph()

    graph.connect('one', 'two')
    graph.connect('two', 'three')
    graph.connect('one', 'three')

    assert.equal(graph.after('one'), 'three')
    assert.equal(graph.before('three'), 'one')
  })

})
