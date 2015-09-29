var Graph  = require('../dist/src/Graph')
var time   = require('microtime')

var SIZE  = 1000000
var graph = new Graph()

console.log('Creating a single pathway at %s length', SIZE)

var start = time.now()
while (SIZE--) {
  graph.append(SIZE)
}
var after = time.now()

console.log('Appending:', (after - start) / 1000 + 'ms')

var beginPath = time.now()
var items = graph.pathway()
var endPath = time.now()

console.log('Pathway:', (endPath - beginPath) / 1000 + 'ms')
