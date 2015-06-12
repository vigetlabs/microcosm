import Store from '../Store'

describe('Store', function() {

  it ('adds a toString method', function() {
    let store = new Store({}, 'sample')
    store.toString().should.equal('sample')
  })

  it ('always sends actions in the context of the store', function() {
    let store = new Store({
      register() {
        return {
          test() {
            return this
          }
        }
      }
    }, 'sample')

    Store.send('test', store).should.equal(store)
  })

  it ('validates that handlers are functions', function(done) {
    let store = {
      register() {
        return { test: null }
      }
    }

    try {
      Store.send('test', store)
    } catch(x) {
      x.should.be.instanceOf(TypeError)
      done()
    }
  })

})
