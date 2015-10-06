import Transaction from '../Transaction'
import assert from 'assert'
import dispatch from '../dispatch'

describe('dispatch', function() {

  it ('returns state if not active', function() {
    let transaction = Transaction('foo')
    let store = {
      register() {
        return { foo: true }
      }
    }

    let state = {}
    let next  = dispatch([ store ], state, Transaction('test'))

    assert.equal(next, state)
  })

})
