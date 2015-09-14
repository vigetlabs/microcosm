import assert from 'assert'
import eventually from '../eventually'

describe('eventually', function() {

  it ('returns null if not given a function', function() {
    assert.equal(eventually(), null)
  })

})
