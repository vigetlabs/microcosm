import Lists from '../Lists'
import assert from 'assert'

describe('Lists Store', function() {

  it ('sets its default state to an empty array', function() {
    assert.deepEqual(Lists.getInitialState(), [])
  })

  it ('sets a contrasting color when creating a record', function() {
    let a = Lists.add([], { color: '#000000' })
    assert.equal(a.pop().contrast, 'white')

    let b = Lists.add([], { color: 'ffffff' })
    assert.equal(b.pop().contrast, 'black')
  })

})
