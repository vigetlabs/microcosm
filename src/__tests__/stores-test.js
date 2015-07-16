let Microcosm = require('../Microcosm')
let Store = require('../Store')
let Transaction = require('../Transaction')

describe('Stores', function() {

  describe('serialize', function() {

    it ('returns state if no serialize method is defined', function() {
      Store.serialize({}, 'state').should.equal('state')
    })

    it ('invokes serialize if defined', function() {
      Store.serialize({
        serialize(state) {
          return state.toUpperCase()
        }
      }, 'state').should.equal('STATE')
    })

  })

  describe('deserialize', function() {
    it ('returns state if no deserialize method is defined', function() {
      Store.deserialize({}, 'state').should.equal('state')
    })

    it ('invokes deserialize if defined', function() {
      Store.deserialize({
        deserialize(state) {
          return state.toUpperCase()
        }
      }, 'state').should.equal('STATE')
    })
  })

  describe('send', function() {
    it ('always sends actions in the context of the store', function() {
      let store = {
        register() {
          return {
            test(state) {
              this.should.equal(store)
            }
          }
        }
      }

      Store.send(store, 'state', Transaction.create('test'))
    })

    it ('returns state if a handler is not provided', function() {
      Store.send({}, 'state', Transaction.create('fiz')).should.equal('state')
    })
  })

})
