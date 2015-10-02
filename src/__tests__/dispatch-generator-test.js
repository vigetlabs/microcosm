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

  it ('sequentially processes multiple yielded generators', function(done) {
    let app = new Microcosm()

    function* asyncRange(start, end) {
      while (start < end) yield new Promise.resolve(start++)
    }

    function* generatorOfGeneratorsofPromises(a, b, c) {
      yield asyncRange(a, b)
      yield asyncRange(b, c)
    }

    let answers = []

    app.addStore('test', {
      register() {
        return {
          [generatorOfGeneratorsofPromises](a=[], b) {
            answers.push(b)
            return b
          }
        }
      }
    })

    app.push(generatorOfGeneratorsofPromises, [1, 4, 7], function() {
      assert.deepEqual([1,2,3,4,5,6], answers)
      assert.equal(app.state.test, 6)
      done()
    })
  })
})
