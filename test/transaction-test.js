let Transaction = require('../src/Transaction')
let assert = require('assert')

describe('Transactions', function() {

  it ('can set a payload when created', function() {
    assert.equal(new Transaction('test', 'body').payload, 'body')
  })

  it ('always ensures the type property is stringified', function() {
    assert.equal(new Transaction(2).type, '2')
  })

  it ('is active if given a payload', function() {
    assert.equal(new Transaction(2).active, false)
    assert.equal(new Transaction(2, 2).active, true)
  })

})
