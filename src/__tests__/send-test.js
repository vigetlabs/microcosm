let Microcosm = require('../Microcosm')
let Transaction = require('../Transaction')
let assert = require('assert')
let send = require('../send')

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
    let store = function() {}

    let answer = send(store, 10, Transaction.create('action'))
    assert.equal(answer, 10)
  })

})
