let lifecycle = require('../lifecycle')
let assert = require('assert')

describe('Lifecycle', function() {

  it ('all lifecycle methods are simple identity functions', function() {
    for (var key in lifecycle) {
      assert.equal(lifecycle[key](key), key)
    }
  })

  it ('all lifecycle methods stringify to their method name', function() {
    for (var key in lifecycle) {
      assert.equal(`${ lifecycle[key] }`, lifecycle[key])
    }
  })

})
