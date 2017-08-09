/**
 * History Performance Benchmark
 */

'use strict'

const { History } = require('../build/microcosm')

const SIZES = [
  1000,
  50000,
  100000
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
  var stats   = { build: 0, root: 0, merge: 0, size: 0, rollforward: 0, memory: 0 }
  var history = new History({ maxHistory: Infinity })

  var memoryBefore = process.memoryUsage().heapUsed

  /**
   * Measure the average append time.
   */
  var now = process.hrtime()
  for (var k = SIZE; k >= 0; k--) {
    history.append(action, 'resolve')
  }
  var end = process.hrtime(now)[1]
  stats.build = (end / 1000000)

  /**
   * Measure the time it takes to determine the size of
   * the current branch.
   */
  var now = process.hrtime()
  history.setSize()
  var end = process.hrtime(now)[1]
  stats.setSize = (end / 1000000)

  var memoryUsage = process.memoryUsage().heapUsed - memoryBefore

  /**
   * Measure time to dispose all nodes in the history. This also has
   * the side effect of helping to test memory leakage later.
   */
  var now = process.hrtime()
  history.setLimit(1)
  history.reconcile(history.root)
  var end = process.hrtime(now)[1]
  stats.rollforward = (end / 1000000)

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
    '::setSize()': stats.setSize.toFixed(2) + 'ms',
    '::rollforward()': stats.rollforward.toFixed(2) + 'ms',
    'Total Memory': (memoryUsage / 1000000).toFixed(2) + 'mbs',
    'Memory Growth': stats.memory.toFixed(2) + 'mbs (' + growth.toFixed(2) + '%)'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
