require('babel/register')

var Graph  = require('../src/Graph')
var time   = require('microtime')
var FACTOR = 10
var MAX    = 100000
var stats  = { branches: [], path: [], root: [], values: [], prune: [], memory: [] }

if ('gc' in global === false) {
  console.error('\nPlease call this script with --expose-gc')
  process.exit()
}

process.stdout.write("Working...");

function test (i)  {
  var SIZE  = MAX / i
  var graph = new Graph()

  var now = time.now()
  for (var j = 0; j < i; j++) {
    for (var k = SIZE; k >= 0; k--) {
      graph.append(k)
    }
  }
  stats.branches.push((time.now() - now) / SIZE)

  now = time.now()
  graph.path()
  stats.path.push(time.now() - now)

  now = time.now()
  graph.root()
  stats.root.push(time.now() - now)

  now = time.now()
  graph.values()
  stats.values.push(time.now() - now)

  now = time.now()
  graph.prune(function() {
    return true
  })
  stats.prune.push(time.now() - now)
}

var Table = require('cli-table')

var table = new Table({
  head: [ 'Branches', 'Nodes', 'Append', 'Path', 'Root', 'Values', 'Prune*', 'Memory Growth' ]
})

for (var i = 1; i <= FACTOR; i++) {
  process.stdout.write(".");

  // Do not allow GC to get in the way of tests
  global.gc()
  var memoryBefore = process.memoryUsage().heapUsed
  test(i)
  global.gc()
  var memoryAfter = process.memoryUsage().heapUsed
  stats.memory.push((memoryAfter - memoryBefore) / memoryBefore * 100)
}

for (var i = 0; i < FACTOR; i++) {
  // Remember time using `microtime` is in microseconds
  table.push([
    (i + 1),
    (MAX / (i + 1)).toLocaleString().split('.')[0],
    (stats.branches[i] / 1000).toFixed(4) + 'ms',
    (stats.path[i] / 1000).toFixed(1) + 'ms',
    (stats.root[i] / 1000).toFixed(1) + 'ms',
    (stats.values[i] / 1000).toFixed(1) + 'ms',
    (stats.prune[i] / 1000).toFixed(1) + 'ms',
    stats.memory[i].toFixed(2) + '%'
  ])
}

console.log('\n' + table.toString())
console.log(" * for entire branch")
