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

    store.send({}, 'test', {}).should.equal(store)
  })

})
