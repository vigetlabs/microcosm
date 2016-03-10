import tag from '../src/tag'
import assert from 'assert'

describe('tag', function() {

  it ('includes the function name', function() {
    assert.equal(tag(function test() {}).toString().search('test'), 0)
  })

  it ('assigns a default name', function() {
    assert.equal(tag(function(){}).toString().search('microcosm_action'), 0)
  })

  it ('can have an override name', function() {
    assert.equal(tag(function(){}, 'test').toString(), 'test')
  })

  it ('throws an error if the provided value is not a function', function() {
    assert.throws(function() {
      tag(null)
    }, /only accepts actions that are functions/)
  })

})
