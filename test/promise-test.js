import Microcosm  from '../src/Microcosm'
import assert     from 'assert'
import eventually from '../src/eventually'

describe('Promises', function() {

  beforeEach(function(done) {
    this.app = new Microcosm()
    this.originalThrow = eventually.throws
    this.app.start(done)
  })

  afterEach(function() {
    eventually.throws = this.originalThrow
  })

  it ('do not trap errors during dispatch', function (done) {
    let action = () => Promise.resolve(true)
    let error  = new Error('Promise trapped error during dispatch!')

    this.app.addStore({
      register() {
        return {
          [action] : () => { throw error }
        }
      }
    })

    eventually.throws = function (exception) {
      assert.equal(exception, error)
      done()
    }

    this.app.push(action)
  })

})
