let Transaction = require('../Transaction')
let { isFSA } = require('flux-standard-action')

describe('Transactions', function() {
  it ('uses the flux standard action spec', function() {
    isFSA(Transaction.create('test')).should.equal(true)
  })

  it ('can set a payload when created', function() {
    Transaction.create('test', 'body').payload.should.equal('body')
  })
})
