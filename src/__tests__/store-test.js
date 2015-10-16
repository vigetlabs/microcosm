let Microcosm = require('../Microcosm')
let assert    = require('assert')

describe('Stores', function() {

  it ('a store can be a function', function(done) {
    let action = function() {}
    let app = new Microcosm()

    app.addStore('test', function() {
      return {
        [action]: true
      }
    })

    app.push(action, [], function() {
      assert(app.state.test)
      done()
    })
  })

})
