let Microcosm = require('../Microcosm')
let Promise   = require('promise')
let assert    = require('assert')

describe('When dispatching promises', function() {
  let pass = function(n) {
    return n
  }
  let single = function(n) {
    return Promise.resolve(n)
  }
  let chain  = n => Promise.resolve(n).then(n => Promise.resolve(n))
  let error  = function(n) {
    return new Promise(function (resolve, reject) {
      setTimeout(reject, 50)
    })
  }
  let late = function(n) {
    return new Promise(function (resolve, reject) {
      setTimeout(_ => resolve(n), 50)
    })
  }
  let app;

  let TestStore = {
    getInitialState: () => 1,
    register() {
      return {
        [single] : this.sum,
        [chain]  : this.sum,
        [error]  : this.sum,
        [late]   : this.sum,
        [pass]   : this.sum
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

  it ('returns the promise from app.push', function(done) {
    app.push(single, 2).done(function() {
      assert.equal(app.state.test, 3)
      done()
    })
  })

  it ('does not dispatch if the promise fails', function(done) {
    app.dispatch = function() {
      done(new Error('Dispatch should not have been called!'))
    }

    app.push(error, [], function(error) {
      assert.ok(error instanceof Error)
      done()
    })
  })

  it ('waits for all promises in the chain to resolve', function(done) {
    app.push(chain, 1, function() {
      assert.equal(app.state.test, 2)
      done()
    })
  })

  it ('respects future changes when it fails', function(done) {
    app.push(error, 1, function() {
      assert.equal(app.state.test, 5)
      done()
    })

    app.push(single, 4)
  })

  it ('does not dispatch transactions for unresolved promises', function(done) {
    app.push(late, 1, function() {
      assert.equal(app.state.test, 6)
      done()
    })

    app.push(pass, 4)
  })
})
