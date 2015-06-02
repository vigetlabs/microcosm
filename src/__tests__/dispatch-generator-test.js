let Microcosm  = require('../Microcosm')

describe('When dispatching generators', function() {
  function* singular(n) {
    yield n
  }

  function* multiple(n) {
    yield n
    yield n + 1
  }

  function* resolve(n) {
    yield n
    yield Promise.resolve(n + 1)
  }

  function* reject(n) {
    yield n
    yield new Promise((resolve, reject) => setTimeout(reject, 50))
  }

  let app;

  let TestStore = {
    getInitialState: () => 1,
    register() {
      return {
        [singular]: this.sum,
        [multiple]: this.sum,
        [resolve] : this.sum,
        [reject]  : this.sum
      }
    },
    sum(a, b) {
      return a + b
    }
  }

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('test', TestStore)
    app.start(done)
  })

  it ('properly reduces when yielding primitives', function(done) {
    app.listen(function() {
      app.get('test').should.equal(3)
      done()
    }).push(singular, 2)
  })

  it ('properly reduces multiple values', function(done) {
    app.listen(function() {
      app.get('test').should.equal(4)
      done()
    }).push(multiple, 2)
  })

  it ('waits for all promises in the chain to resolve', function(done) {
    app.listen(function() {
      app.get('test').should.equal(4)
      done()
    }).push(resolve, 2)
  })

  it ('respects future changes when it fails', function(done) {
    app.push(reject, 1).catch(function() {
      app.get('test').should.equal(6)
      done()
    }).catch(e => console.log(e))

    app.push(singular, 4)
  })
})
