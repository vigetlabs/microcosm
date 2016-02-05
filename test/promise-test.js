import Microcosm  from '../src/Microcosm'
import assert     from 'assert'
import eventually from '../src/eventually'

describe('When working with promises', function() {

  beforeEach(function(done) {
    this.app = new Microcosm()
    this.originalThrow = eventually.throws
    this.app.start(done)
  })

  afterEach(function() {
    eventually.throws = this.originalThrow
  })

  context('and a store handler raises an exception', function() {
    let action = () => Promise.resolve(true)
    let error  = new Error('Promise trapped error during dispatch!')

    beforeEach(function() {
      this.app.addStore({
        register() {
          return {
            [action] : () => { throw error }
          }
        }
      })
    })

    it ('does not trap errors raised in that store handler', function (done) {
      eventually.throws = function (exception) {
        assert.equal(exception, error)
        done()
      }

      this.app.push(action)
    })
  })
})
