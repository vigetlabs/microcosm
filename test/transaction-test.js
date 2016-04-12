import Transaction from '../src/Transaction'
import assert from 'assert'

describe('Transactions', function() {

  it ('always ensures the type property is stringified', function() {
    assert.equal(new Transaction(2).type, '2')
  })

})
