import assert from 'assert'
import merge  from '../src/merge'

describe('merge', function() {

  it ('will only merge into a simple object', function() {
    assert.throws(function() {
      merge([], {})
    })
  })

  it ('will only merge from simple object', function() {
    assert.throws(function() {
      merge({}, [])
    })
  })

  it ('merges keys into a target', function() {
    let sample = merge({ one: 'one' }, { two: 'two' })

    assert.equal(sample.one, 'one')
    assert.equal(sample.two, 'two')
  })

})
