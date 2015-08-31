import Items from '../Items'
import assert from 'assert'

describe('Items Store', function() {

  it ('sets its default state to an empty array', function() {
    assert.deepEqual(Items.getInitialState(), [])
  })

})
