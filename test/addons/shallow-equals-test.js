import shallowEqual from '../../src/addons/connect/shallow-equal'
import assert from 'assert'

describe('shallow-equals', function () {

  it ('returns true when given the exact same object', function () {
    let sample = {}
    assert.equal(shallowEqual(sample, sample), true)
  })

  it ('returns true when given the exact same keys', function () {
    let a = { one: 1 }
    let b = { one: 1 }

    assert.equal(shallowEqual(a, b), true)
  })

  it ('returns false when given the exact different keys', function () {
    let a = { name: 'Bill' }
    let b = { name: 'Cindy' }

    assert.equal(shallowEqual(a, b), false)
  })

})
