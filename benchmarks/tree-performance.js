var fork = require('child_process').fork

var FACTOR = 10
var MAX    = 100000
var stats  = []

if ('gc' in global === false) {
  console.error('\nPlease call this script with --expose-gc')
  process.exit()
}

function queue(size) {
  var test = fork(__dirname + '/tests/build-tree', [ MAX / size, size ])

  test.on('message', function(data) {
    stats.push(data)

    if (size < FACTOR) {
      queue(size + 1)
    } else {
      report()
    }
  })
}

queue(1)

function report() {
  var Table = require('cli-table')

  var table = new Table({
    head: [ 'Branches', 'Nodes', 'Append', 'Root', 'Reduce', 'Prune*', 'Memory Growth' ]
  })

  // Remember time using `microtime` is in microseconds
  stats.forEach(function(row, i) {
    table.push([
      // How many branches in the tree?
      i + 1,
      // How many nodes per branch?
      (MAX / (i + 1)).toLocaleString().split('.')[0],
      // Append Time
      row.branches.toFixed(4) + 'ms',
      // Time to get root node
      row.root.toFixed(2) + 'ms',
      // Time to reduce through entire branch
      row.reduce.toFixed(2) + 'ms',
      // Time to remove up all nodes
      row.prune.toFixed(2) + 'ms',
      // Memory growth
      row.memory.toFixed(3) + '%'
    ])
  })

  console.log('\n' + table.toString())
  console.log(" * for entire tree")
}
