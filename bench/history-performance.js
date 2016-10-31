/**
 * History Performance Benchmark
 */

import History from '../src/history'
import merge from '../src/merge'
import time from 'microtime'

const SIZES = [
  1000,
  10000,
  50000,
  100000,
  200000,
  400000,
  1000000
]

console.log('\nConducting history benchmark...\n')

const results = SIZES.map(function (SIZE) {
  /**
   * Force garbage collection. This is exposed by invoking node with
   * --expose-gc. This allows us to record heap usage before and after the test
   * to check for memory leakage
   */
  global.gc()

  var action  = () => {}
  var stats   = { build: 0, root: 0, merge: 0, size: 0, prune: 0, memory: 0 }
  var history = new History()

  var memoryBefore = process.memoryUsage().heapUsed

  /**
   * Measure the average append time.
   */
  var now = time.now()
  for (var k = SIZE; k >= 0; k--) {
    history.append(action)
  }
  stats.build = ((time.now() - now) / 1000)

  /**
   * Measure the time it takes to determine the size of
   * the current branch.
   */
  now = time.now()
  history.setSize()
  stats.size = (time.now() - now) / 1000

  /**
   * Measure time to build an array of the current branch. This is used
   * by other history operations.
   */
  now = time.now()
  history.toArray()
  stats.toArray = (time.now() - now) / 1000

  var memoryUsage = process.memoryUsage().heapUsed - memoryBefore

  /**
   * Measure time to dispose all nodes in the history. This also has
   * the side effect of helping to test memory leakage later.
   */
  history.toArray().forEach(a => a.resolve())
  now = time.now()
  history.archive()
  stats.prune = (time.now() - now) / 1000

  /**
   * Now that the history has been pruned, force garbage collection
   * and record the increase in heap usage.
   */
  global.gc()

  var memoryAfter = process.memoryUsage().heapUsed
  var growth = (1 - (memoryBefore / memoryAfter)) * 100
  stats.memory = (memoryAfter - memoryBefore) / 100000

  return {
    'Nodes': SIZE.toLocaleString(),
    '::append()': stats.build.toFixed(2) + 'ms',
    '::toArray()': stats.toArray.toFixed(2) + 'ms',
    '::setSize()': stats.size.toFixed(2) + 'ms',
    '::prune()': stats.prune.toFixed(2) + 'ms',
    'Total Memory': (memoryUsage / 1000000).toFixed(2) + 'mbs',
    'Memory Growth': stats.memory.toFixed(2) + 'mbs (' + growth.toFixed(2) + '%)'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
