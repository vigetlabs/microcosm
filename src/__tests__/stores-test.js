let Microcosm = require('../Microcosm')
let Store = require('../Store')
let Transaction = require('../Transaction')
let assert = require('assert')

describe('Stores', function() {

  describe('serialize', function() {

    it ('returns state if no serialize method is defined', function() {
      let state = {}
      assert.equal(Store.serialize({}, state), state)
    })

    it ('invokes serialize if defined', function() {
      let answer = Store.serialize({
        serialize(state) {
          return state.toUpperCase()
        }
      }, 'state')

      assert.equal(answer, 'STATE')
    })

  })

  describe('deserialize', function() {
    it ('returns state if no deserialize method is defined', function() {
      let state = {}
      assert.equal(Store.deserialize({}, state), state)
    })

    it ('invokes deserialize if defined', function() {
      let answer = Store.deserialize({
        deserialize(state) {
          return state.toUpperCase()
        }
      }, 'state')

      assert.equal(answer, 'STATE')
    })
  })

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

      Store.send(store, 'state', Transaction.create('test'))
    })

    it ('returns state if a handler is not provided', function() {
      let answer = Store.send({}, 'state', Transaction.create('fiz'))
      assert.equal(answer, 'state')
    })

    it ('handles cases when a store is a function', function() {
      let store = function() {
        return {
          action: (a, b) => a * b
        }
      }

      let answer = Store.send(store, 2, Transaction.create('action', 2))
      assert.equal(answer, 4)
    })

    it ('allows handlers to not be functions', function() {
      let store = function() {
        return {
          action: 5
        }
      }

      let answer = Store.send(store, 2, Transaction.create('action'))
      assert.equal(answer, 5)
    })

    it ('does not modify state in cases where no registration value is returned', function() {
      let store = function() {}

      let answer = Store.send(store, 10, Transaction.create('action'))
      assert.equal(answer, 10)
    })
  })

})
