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
  })

})
