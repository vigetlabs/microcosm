/**
 * History Performance Benchmark
 */

'use strict'

const { History } = require('../build')

const SIZES = [1000, 10000, 25000]

console.log('\nConducting history benchmark...\n')

const results = SIZES.map(function(SIZE) {
  /**
   * Force garbage collection. This is exposed by invoking node with
   * --expose-gc. This allows us to record heap usage before and after the test
   * to check for memory leakage
   */
  global.gc()

  var stats = {
    build: 0,
    root: 0,
    merge: 0,
    memory: 0
  }
  var history = new History({ debug: true })

  var memoryBefore = process.memoryUsage().heapUsed

  /**
   * Measure the average append time.
   */
  var now = process.hrtime()
  let args = []
  for (var k = SIZE; k >= 0; k--) {
    history.append('test', args, null)
  }
  var end = process.hrtime(now)[1]
  stats.build = end / 1000000
  var memoryUsage = process.memoryUsage().heapUsed - memoryBefore

  history.debug = false
  history.archive()

  /**
   * Now that the history has been pruned, force garbage collection
   * and record the increase in heap usage.
   */
  global.gc()

  var memoryAfter = process.memoryUsage().heapUsed
  var growth = (1 - memoryBefore / memoryAfter) * 100
  stats.memory = (memoryAfter - memoryBefore) / 100000

  return {
    Nodes: SIZE.toLocaleString(),
    '::append()': stats.build.toFixed(2) + 'ms',
    'Total Memory': (memoryUsage / 1000000).toFixed(2) + 'mbs',
    'Memory Growth':
      stats.memory.toFixed(2) + 'mbs (' + growth.toFixed(2) + '%)'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
