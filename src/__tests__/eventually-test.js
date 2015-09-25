import assert from 'assert'
import eventually from '../eventually'

describe('eventually', function() {

  it ('returns undefined if not given a function', function() {
    assert.equal(eventually(), undefined)
    assert.equal(eventually(undefined), undefined)
    assert.equal(eventually(3), undefined)
  })

})
