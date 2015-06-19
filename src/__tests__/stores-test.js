let Microcosm = require('../Microcosm')
let Store     = require('../Store')

describe('Stores', function() {

  it ('throws an error if no key is given in addStore', function(done) {
    try {
      new Microcosm().addStore({})
    } catch(x) {
      x.should.be.instanceOf(TypeError)
      done()
    }
  })

  it ('always sends actions in the context of the store', function(done) {
    let app  = new Microcosm()
    let test = function test () {}

    let store = {
      register() {
        return {
          [test](state) {
            this.should.equal(store)
            done()
          }
        }
      }
    }

    app.addStore('test', store).push(test)
  })

})
