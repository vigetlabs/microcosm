import Promise from 'promise'
import assert from 'assert'
import eventually from '../src/eventually'

describe('eventually', function() {

  beforeEach(function() {
    this.originalTimeout = global.setTimeout
  })

  afterEach(function() {
    global.setTimeout = this.originalTimeout
  })

  it ('respects the scope of bound functions', function(done) {
    eventually(function() {
      assert.equal(this, 'test')
      done()
    }.bind('test'))
  })

  it ('does not allow promises callbacks to absorb errors', function(done) {
    global.setTimeout = function(callback) {
      assert.throws(callback, /It worked/)
      done()
    }

    Promise.resolve().then(function() {
      eventually(function() {
        throw new Error('It worked')
      })
    }).catch(function(error) {
      done(new Error('The promise caught the error in `eventually`.'))
    })
  })

  it ('can eventually throw an error', function(done) {
    global.setTimeout = function(callback) {
      assert.throws(callback, /It worked/)
      done()
    }

    eventually.throws('It worked')
  })

})
