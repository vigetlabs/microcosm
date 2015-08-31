let Transaction = require('../Transaction')
let assert = require('assert')
let { isFSA } = require('flux-standard-action')

describe('Transactions', function() {
  it ('uses the flux standard action spec', function() {
    assert(isFSA(Transaction.create('test')))
  })

  it ('can set a payload when created', function() {
    assert.equal(Transaction.create('test', 'body').payload, 'body')
  })
})
