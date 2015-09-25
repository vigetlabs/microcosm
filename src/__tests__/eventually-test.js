import Promise from 'promise'
import assert from 'assert'
import eventually from '../eventually'

describe('eventually', function() {


  it ('returns undefined if not given a function', function() {
    assert.equal(eventually(), undefined)
    assert.equal(eventually(undefined), undefined)
    assert.equal(eventually(3), undefined)
  })

  it ('respects the scope of bound functions', function(done) {
    eventually(function() {
      assert.equal(this, 'test')
      done()
    }.bind('test'))
  })

  it ('does not allow promises callbacks to absorb errors', function(done) {
    let originalTimeout = global.setTimeout

    global.setTimeout = function(callback) {
      assert.throws(callback, /It worked/)
      global.setTimeout = originalTimeout
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

})
