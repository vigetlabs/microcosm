/**
 * Tree Performance Benchmark
 */

var Tree  = require(__dirname + '/../dist/src/Tree')
var merge = require(__dirname + '/../dist/src/merge')
var time  = require('microtime')
var SIZE  = 10000
var stats = { build: 0, root: 0, merge: 0, size: 0, prune: 0, memory: 0 }
var tree  = new Tree()

/**
 * Force garbage collection. This is exposed by invoking
 * node with --expose-gc. This allows us to record heap usage
 * before and after the test to check for memory leakage
 */
global.gc()

var memoryBefore = process.memoryUsage().heapUsed


/**
 * Measure the average append time.
 */
var now = time.now()
for (var k = SIZE; k >= 0; k--) {
  tree.append({ one: 'one', two: 'two', three: 'three' })
}
stats.build = ((time.now() - now) / 1000) / SIZE

/**
 * Measure the time it takes to bubble up to the root
 * of the tree from the current focal point.
 */
now = time.now()
tree.root()
stats.root = (time.now() - now) / 1000


/**
 * Measure the time it takes to determine the size of
 * the current branch. This should loosely be in line with
 * ::root()
 */
now = time.now()
tree.size()
stats.size = (time.now() - now) / 1000


/**
 * Measure time to merge together all nodes. This is a useful
 * gut check of the potential fastest possible merger of objects
 * within Microcosm's dispatch process.
 */
now = time.now()
tree.reduce(merge, {})
stats.merge = (time.now() - now) / 1000


/**
 * Measure time to dispose all nodes in the tree. This also has
 * the side effect of helping to test memory leakage later.
 */
now = time.now()
tree.prune(function() {
  return true
})
stats.prune = (time.now() - now) / 1000


/**
 * Now that the tree has been pruned, force garbage collection
 * and record the increase in heap usage.
 */
global.gc()
var memoryAfter = process.memoryUsage().heapUsed
stats.memory = ((memoryAfter - memoryBefore) / memoryBefore) * 100


/**
 * Finally, report our findings.
 */
require('console.table')

console.table([{
  'Nodes': SIZE,
  '::append()': stats.build.toFixed(4) + 'ms',
  '::root()': stats.root.toFixed(2) + 'ms',
  '::reduce(merge)': stats.merge.toFixed(2) + 'ms',
  '::size()': stats.size.toFixed(2) + 'ms',
  '::prune()': stats.prune.toFixed(2) + 'ms',
  'Memory Growth': stats.memory.toFixed(3) + '%'
}])


/**
 * As a final check, assert that memory usage hasn't grown significantly.
 * Some growth is to be expected, however anything above 2% is a clear failure
 * of `prune()` to dispose of nodes.
 */
var assert = require('assert')

assert(stats.memory < 2, 'Memory should not exceed 2% increase')
