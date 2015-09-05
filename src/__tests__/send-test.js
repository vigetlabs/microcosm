let Microcosm = require('../Microcosm')
let Transaction = require('../Transaction')
let assert = require('assert')
let send = require('../send')
let lifecycle = require('../lifecycle')

describe('send', function() {

  it ('always sends actions in the context of the store', function() {
    let store = {
      register() {
        return {
          test(state) {
            assert.equal(this, store)
          }
        }
      }
    }

    send(store, 'state', Transaction.create('test'))
  })

  it ('returns state if a handler is not provided', function() {
    let answer = send({}, 'state', Transaction.create('fiz'))
    assert.equal(answer, 'state')
  })

  it ('allows handlers to not be functions', function() {
    let store = {
      register() {
        return {
          action: 5
        }
      }
    }

    let answer = send(store, 2, Transaction.create('action'))
    assert.equal(answer, 5)
  })

  it ('does not modify state in cases where no registration value is returned', function() {
    let store = {}

    let answer = send(store, 10, Transaction.create('action'))
    assert.equal(answer, 10)
  })

  describe('Lifecycle passthrough', function() {

    it ('allows defined lifecycle methods to bypass the register function', function() {
      let store = {
        getInitialState() {
          return 'test'
        }
      }

      let answer = send(store, null, lifecycle.willStart)

      assert.equal(answer, 'test')
    })

    it ('allows lifecycle methods as registered actions', function() {
      let store = {
        register() {
          return { [lifecycle.willStart]: 'test' }
        }
      }

      let answer = send(store, null, lifecycle.willStart)

      assert.equal(answer, 'test')
    })

    it ('ignores methods defined by the store that are not lifecycle methods matching dispatched types', function() {
      let store = {
        foo() {
          return 'test'
        }
      }

      let answer = send(store, null, { type: 'foo' })

      assert.equal(answer, null)
    })

  })

})
