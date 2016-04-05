import Microcosm from '../src/Microcosm'
import assert from 'assert'

describe('When dispatching primitive values', function() {
  let app = null
  let add = num => num

  let Store = {
    getInitialState: () => 1,
    register() {
      return {
        [add]: (a, b) => a + b
      }
    }
  }

  it ('properly reduces from a store', function(done) {
    app = new Microcosm()

    app.addStore('test', Store)

    app.start()

    app.push(add, 2, function() {
      assert.equal(app.state.test, 3)
      done()
    })
  })
})
