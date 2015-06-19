let Microcosm  = require('../Microcosm')
let Promise = require('promise')

describe('When dispatching generators', function() {

  it ('properly reduces when yielding primitives', function() {
    let app = new Microcosm()

    function* single(n) {
      yield n
    }

    app.addStore('test', {
      getInitialState: () => 0,
      register() {
        return { [single]: (a, b) => a + b }
      }
    })

    app.start()
    app.push(single, 2)

    app.state.test.should.equal(2)
  })

  it ('properly reduces multiple values', function() {
    let app = new Microcosm()

    function* multiple(n) {
      yield n
      yield n + 1
    }

    app.addStore('test', {
      getInitialState: () => 0,
      register() {
        return { [multiple]: (a, b) => a + b }
      }
    })

    app.start()
    app.push(multiple, 2)

    app.state.test.should.equal(3)
  })

  it ('waits for all promises in the chain to resolve', function(done) {
    let app = new Microcosm()

    function* resolve(n) {
      yield n
      yield Promise.resolve(n + 1)
    }

    app.addStore('test', {
      getInitialState: () => 0,
      register() {
        return { [resolve]: (a, b) => a + b }
      }
    })

    app.start()

    app.push(resolve, 2).done(function() {
      app.state.test.should.equal(3)
      done()
    })
  })

  it ('respects future changes when it fails', function(done) {
    let app = new Microcosm()

    function* single(n) {
      yield n
    }

    function* reject(n) {
      yield n
      yield new Promise((resolve, reject) => setTimeout(function() {
        reject('Rejected promise')
      }, 50))
    }

    app.addStore('test', {
      getInitialState: () => 0,
      register() {
        return {
          [single]: (a, b) => a + b,
          [reject]: (a, b) => a + b
        }
      }
    })

    app.start()

    app.push(reject, 1).done(null, function(error) {
      app.state.test.should.equal(4)
      done()
    })

    app.push(single, 4)
  })
})
