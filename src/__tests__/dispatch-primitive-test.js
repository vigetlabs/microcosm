let Microcosm = require('../Microcosm')
let assert    = require('assert')

describe('When dispatching primitive values', function() {
  let app = new Microcosm()
  let add = num => num

  let Store = {
    getInitialState: () => 1,
    register() {
      return {
        [add]: (a, b) => a + b
      }
    }
  }

  app.addStore('test', Store)

  beforeEach(function(done) {
    app.start(done)
  })

  it ('properly reduces from a store', function(done) {
    app.push(add, 2, function() {
      assert.equal(app.state.test, Store.getInitialState() + 2)
      done()
    })
  })
})
