import Lists from '../lists'
import assert from 'assert'

describe('Lists Store', function() {

  it ('sets its default state to an empty array', function() {
    assert.deepEqual(Lists.getInitialState(), [])
  })

})
