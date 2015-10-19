import coroutine from '../src/coroutine'
import assert from 'assert'
import Promise from 'promise'

describe('coroutines', function() {

  it ('returns the results back to yields in generators', function(done) {
    function* test () {
      var first = yield Promise.resolve('test')
      assert.equal(first, 'test')

      var second = yield Promise.resolve(first.toUpperCase())
      assert.equal(second, 'TEST')
    }

    coroutine(test(), function(error, body, complete) {
      if (complete) {
        assert.equal(body, 'TEST')
        assert(complete)
        done(error)
      }
    })
  })

})
