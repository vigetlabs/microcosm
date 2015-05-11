import Store from '../Store'

describe('Store', function() {

  it ('adds a toString method', function() {
    let store = new Store({}, 'sample')
    store.toString().should.equal('sample')
  })

})
