require('console.table')

var Tree   = require(__dirname + '/../dist/src/Tree')
var time   = require('microtime')
var SIZE   = 10000
var stats  = { build: 0, root: 0, merge: 0, size: 0, prune: 0, memory: 0 }

var tree = new Tree()

// Do not allow GC to get in the way of tests
global.gc()
var memoryBefore = process.memoryUsage().heapUsed

var now = time.now()
for (var k = SIZE; k >= 0; k--) {
  tree.append({ one: 'one', two: 'two', three: 'three' })
}
stats.build = (time.now() - now) / 1000

now = time.now()
tree.root()
stats.root = (time.now() - now) / 1000

now = time.now()
tree.size()
stats.size = (time.now() - now) / 1000

now = time.now()
tree.reduce(function(a, b) {
  for (var key in b) {
    a[key] = b[key]
  }
  return a
}, {})
stats.merge = (time.now() - now) / 1000

now = time.now()
tree.prune(function() {
  return true
})
stats.prune = (time.now() - now) / 1000

global.gc()
var memoryAfter = process.memoryUsage().heapUsed
stats.memory = (memoryAfter - memoryBefore) / memoryBefore * 100

console.table([{
  'Nodes': SIZE,
  'Construction': stats.build.toFixed(2) + 'ms',
  '::root()': stats.root.toFixed(2) + 'ms',
  '::reduce(merge)': stats.merge.toFixed(2) + 'ms',
  '::size()': stats.size.toFixed(2) + 'ms',
  '::prune()': stats.prune.toFixed(2) + 'ms',
  'Memory Growth': stats.memory.toFixed(3) + '%'
}])
