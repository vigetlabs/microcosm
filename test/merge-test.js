import assert from 'assert'
import merge  from '../src/merge'

describe('merge', function() {

  it ('merges keys into a target', function() {
    let sample = merge({ one: 'one' }, { two: 'two' })

    assert.equal(sample.one, 'one')
    assert.equal(sample.two, 'two')
  })

  it ('does not merge nully values', function() {
    let initial = []

    assert.equal(merge(initial, false), initial)
    assert.equal(merge(initial, null), initial)
    assert.equal(merge(initial, undefined), initial)
  })

})
