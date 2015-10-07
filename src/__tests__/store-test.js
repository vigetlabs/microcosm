let Microcosm = require('../Microcosm')
let assert    = require('assert')

describe('Stores', function() {

  it ('throws an error if a non-string key is given in addStore', function(done) {
    try {
      new Microcosm().addStore({})
    } catch(x) {
      assert(x instanceof TypeError)
      done()
    }
  })

  it ('throws an error if missing a store', function(done) {
    try {
      new Microcosm().addStore('foo')
    } catch(x) {
      assert(x instanceof TypeError)
      done()
    }
  })

})
