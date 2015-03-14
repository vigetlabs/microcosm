import Store from '../Store'

describe('Store', function() {

  it ('returns the state on toJSON', function() {
    let store = new Store

    store.state = { foo: 'bar' }

    JSON.stringify(store).should.equal("{\"foo\":\"bar\"}")
  })

  it ('can register a handler for dispatch', function(done) {
    class TestStore extends Store {
      register() {
        return {
          fizz(data) {
            data.should.equal('buzz')
            done()
          }
        }
      }
    }

    let store = new TestStore()

    store.send({ type: 'fizz', body: 'buzz' })
  })

  it ('does not execute a task it does not know', function() {
    let store = new Store
    store.send({ type: 'fizz', body: 'buzz' })
  })

})
