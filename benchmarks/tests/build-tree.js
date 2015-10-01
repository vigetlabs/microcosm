var Tree   = require(__dirname + '/../../dist/src/Tree')
var time   = require('microtime')
var SIZE   = process.argv[2]
var FACTOR = process.argv[3]
var tree   = new Tree()
var stats  = { branches: 0, root: 0, reduce: 0, prune: 0, memory: 0 }

process.stdout.write(FACTOR + ' branches with ' + (SIZE | 0) + ' nodes... ')

// Do not allow GC to get in the way of tests
global.gc()
var memoryBefore = process.memoryUsage().heapUsed

var now = time.now()
for (var j = 0; j < FACTOR; j++) {
  for (var k = SIZE; k >= 0; k--) {
    tree.append(k)
  }
}
stats.branches = ((time.now() - now) / SIZE) / 1000

now = time.now()
tree.root()
stats.root = (time.now() - now) / 1000

now = time.now()
tree.reduce(function(a) { return a + 1 }, 0)
stats.reduce = (time.now() - now) / 1000

now = time.now()
tree.prune(function() {
  return true
})
stats.prune = (time.now() - now) / 1000

global.gc()
var memoryAfter = process.memoryUsage().heapUsed
stats.memory = (memoryAfter - memoryBefore) / memoryBefore * 100

process.send(stats)
process.stdout.write('done\n')
