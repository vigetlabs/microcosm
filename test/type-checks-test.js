let typeChecks = require('../src/type-checks')
let assert = require('assert')

describe('isObject', function() {

  it ('returns false if not given an object', function() {
    assert.equal(typeChecks.isObject(true), false)
  })

  it ('returns true if given an object', function() {
    assert.equal(typeChecks.isObject({}), true)
  })

  it ('returns false if given null (typeof null is object)', function() {
    assert.equal(typeChecks.isObject(null), false)
  })

})
