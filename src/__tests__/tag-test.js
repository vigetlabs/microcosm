let tag = require('../tag')
let assert = require('assert')

describe('tag', function() {

  it ('includes the function name', function() {
    assert.equal(tag(function test() {}).toString().search('test'), 0)
  })

  it ('assigns a default name', function() {
    assert.equal(tag({}).toString().search('microcosm_action'), 0)
  })

})
