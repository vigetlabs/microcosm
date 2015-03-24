import Store from '../Store'

describe('Store', function() {

  it ('has a default toString which throws an error', function(done) {
    try {
      Store.toString()
    } catch(x) {
      done()
    }
  })

})
