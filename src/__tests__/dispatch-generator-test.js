let Microcosm  = require('../Microcosm')
let Promise = require('promise')
let assert = require('assert')

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

    assert.equal(app.state.test, 2)
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

    app.start().push(multiple, 2, function() {
      assert.equal(app.state.test, 3)
    })
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

    app.start().push(resolve, 2, function() {
      assert.equal(app.state.test, 3)
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
        reject(new Error('Rejected Promise'))
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
      assert.equal(app.state.test, 4)
      assert.ok(error instanceof Error)
      done()
    })

    app.push(single, 4)
  })

  it ('runs results through coroutine', function(done) {
    let app = new Microcosm()

    function* range(start, end) {
      while (start < end) {
        yield start++
      }
    }

    function* generatorOfGenerators(a, b) {
      yield range(a, b)
    }

    app.addStore('test', {
      register() {
        return {
          // Test concatenation to ensure the state is the same every
          // single time
          [generatorOfGenerators]: (a=[], b) => a.concat(b)
        }
      }
    })

    app.start()

    app.push(generatorOfGenerators, [1, 4], function() {
      assert.deepEqual(app.state.test, [3])
      done()
    })
  })
})
