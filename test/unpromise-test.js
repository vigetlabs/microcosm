import Microcosm from '../src/Microcosm'
import Promise from 'promise'
import assert from 'assert'
import unpromise from '../src/unpromise'

describe('unpromise', function() {

  beforeEach(function() {
    this.throws = unpromise.throws
  })

  afterEach(function() {
    unpromise.throws = this.throws
  })

  it ('does not allow promises callbacks to absorb errors', function(done) {
    unpromise.throws = function (error) {
      assert.equal(error.message, 'It worked')
      done()
    }

    let promise = Promise.resolve(true)

    promise.catch(done)

    unpromise(promise, function() {
      throw new Error('It worked')
    })
  })

  context('When an action returns a promises', function() {
    let action = () => Promise.resolve(true)
    let error  = new Error('Uncaught error during dispatch!')

    beforeEach(function(done) {
      this.app = new Microcosm()

      this.app.addStore(function() {
        return {
          [action]: () => { throw error }
        }
      })

      this.app.start(done)
    })

    it ('does not trap errors raised in that store handler', function (done) {
      unpromise.throws = function (err) {
        assert.equal(err, error)
        done()
      }

      this.app.push(action).catch(done)
    })
  })
})
