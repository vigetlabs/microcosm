let Transaction = require('../src/Transaction')
let assert = require('assert')

describe('Transactions', function() {

  it ('can set a payload when created', function() {
    assert.equal(Transaction('test', 'body').payload, 'body')
  })

  it ('always ensures the type property is stringified', function() {
    assert.equal(Transaction(2).type, '2')
  })

  it ('is active if given a payload', function() {
    assert.equal(Transaction(2).active, false)
    assert.equal(Transaction(2, 2).active, true)
  })

  it ('throws if not given a type', function() {
    assert.throws(function() {
      Transaction()
    })
  })

})
